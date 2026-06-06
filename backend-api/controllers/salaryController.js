const db = require('../db');

exports.getSalaries = async (req, res) => {
  if (req.user.role !== 'hrd') {
    // Karyawan hanya bisa melihat histori gajinya sendiri
    try {
      const result = await db.query(
        `SELECT s.*, u.name as user_name, d.name as department_name
         FROM salaries s 
         JOIN users u ON s.user_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE s.user_id = $1
         ORDER BY s.year DESC, s.month DESC`,
        [req.user.id]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  // HRD: Ambil rekap gaji karyawan terfilter beserta kehadiran bulanan
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const departmentId = req.query.department_id ? parseInt(req.query.department_id) : null;

    let query = `
      SELECT u.id, u.name, u.email, u.created_at, d.id AS department_id, d.name AS department_name, COALESCE(d.basic_salary, 0) AS dept_basic_salary
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role = 'karyawan'
    `;
    let params = [];
    if (departmentId) {
      query += ` AND u.department_id = $1`;
      params.push(departmentId);
    }
    query += ` ORDER BY u.name ASC`;

    const employeesResult = await db.query(query, params);
    const employees = employeesResult.rows;

    const salariesResult = await db.query(
      `SELECT * FROM salaries WHERE month = $1 AND year = $2`,
      [month, year]
    );
    const salariesByUserId = {};
    for (const s of salariesResult.rows) {
      salariesByUserId[s.user_id] = s;
    }

    const { getHolidaysMap } = require('../utils/holidayHelper');
    const holidaysMap = await getHolidaysMap(year, month);

    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const result = [];

    for (const emp of employees) {
      // Ambil jadwal departemen karyawan tersebut
      const schedResult = await db.query(
        `SELECT s.day_of_week
         FROM schedules s
         WHERE s.department_id = $1`,
        [emp.department_id]
      );
      const scheduledDays = new Set(schedResult.rows.map(s => s.day_of_week));

      // Ambil catatan presensi karyawan di bulan target
      const attResult = await db.query(
        `SELECT a.check_in, a.status
         FROM attendances a
         WHERE a.user_id = $1
           AND DATE((a.check_in AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta') BETWEEN $2 AND $3`,
        [emp.id, startDate, endDate]
      );
      const attByDate = {};
      for (const a of attResult.rows) {
        const d = new Date(a.check_in).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        attByDate[d] = a.status;
      }

      // Ambil pengajuan izin yang disetujui
      const leaveResult = await db.query(
        `SELECT lr.start_date, lr.end_date
         FROM leave_requests lr
         WHERE lr.user_id = $1
           AND lr.status = 'approved'
           AND lr.start_date <= $3
           AND lr.end_date >= $2`,
        [emp.id, startDate, endDate]
      );
      const leaveDates = new Set();
      for (const lr of leaveResult.rows) {
        const startStr = new Date(lr.start_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        const endStr = new Date(lr.end_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        let cur = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');
        while (cur <= end) {
          leaveDates.add(cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }));
          cur.setDate(cur.getDate() + 1);
        }
      }

      // Kalkulasi status kehadiran bulanan
      let countHadir = 0, countTerlambat = 0, countAlpha = 0, countIzin = 0, countLibur = 0;
      const userCreatedDateStr = new Date(emp.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

      for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();

        if (!scheduledDays.has(dayOfWeek)) continue; // bukan hari kerja departemen

        const statusStr = attByDate[dateStr];
        const onLeave = leaveDates.has(dateStr);
        const isNationalHoliday = holidaysMap.has(dateStr);

        let status;
        if (statusStr) {
          status = statusStr;
        } else if (onLeave) {
          status = 'izin';
        } else if (dateStr <= userCreatedDateStr) {
          status = '-';
        } else {
          if (isNationalHoliday) {
            status = 'libur';
          } else {
            const todayJakartaStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
            status = dateStr < todayJakartaStr ? 'alpha' : 'upcoming';
          }
        }

        if (status === 'hadir') countHadir++;
        else if (status === 'terlambat') countTerlambat++;
        else if (status === 'alpha') countAlpha++;
        else if (status === 'izin' || status === 'sakit') countIzin++;
        else if (status === 'libur') countLibur++;
      }

      // Ambil gaji pokok dan record gaji jika pernah disimpan
      const existingSal = salariesByUserId[emp.id];

      result.push({
        user_id: emp.id,
        user_name: emp.name,
        email: emp.email,
        department_name: emp.department_name || '—',
        basic_salary: existingSal ? parseFloat(existingSal.basic_salary) : parseFloat(emp.dept_basic_salary),
        allowances: existingSal ? parseFloat(existingSal.allowances) : 0,
        deductions: existingSal ? parseFloat(existingSal.deductions) : 0,
        net_salary: existingSal ? parseFloat(existingSal.net_salary) : parseFloat(emp.dept_basic_salary),
        is_saved: !!existingSal,
        salary_id: existingSal ? existingSal.id : null,
        attendance_summary: {
          hadir: countHadir,
          terlambat: countTerlambat,
          alpha: countAlpha,
          izin_sakit: countIzin,
          libur: countLibur
        }
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createSalary = async (req, res) => {
  const { user_id, month, year, basic_salary, allowances, deductions } = req.body;
  const net_salary = parseFloat(basic_salary) + parseFloat(allowances || 0) - parseFloat(deductions || 0);
  try {
    // Cek apakah data gaji bulan/tahun target karyawan tersebut sudah pernah dibuat
    const checkResult = await db.query(
      'SELECT id FROM salaries WHERE user_id = $1 AND month = $2 AND year = $3',
      [user_id, month, year]
    );

    let result;
    if (checkResult.rows.length > 0) {
      // UPDATE data gaji yang ada
      result = await db.query(
        `UPDATE salaries 
         SET basic_salary = $1, allowances = $2, deductions = $3, net_salary = $4 
         WHERE id = $5 RETURNING *`,
        [basic_salary, allowances, deductions, net_salary, checkResult.rows[0].id]
      );
    } else {
      // INSERT data gaji baru
      result = await db.query(
        `INSERT INTO salaries (user_id, month, year, basic_salary, allowances, deductions, net_salary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user_id, month, year, basic_salary, allowances, deductions, net_salary]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
