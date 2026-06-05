const db = require('../db');
const firestore = require('../firebase');
const { getHolidaysMap, checkHoliday } = require('../utils/holidayHelper');
const { uploadToStorage } = require('../utils/storageHelper');
const { verifyFaces } = require('../utils/faceHelper');

// @desc    Check-in
exports.checkIn = async (req, res) => {
  const { schedule_id, latitude, longitude, liveness_score } = req.body;
  const user_id = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Foto selfie wajib dilampirkan untuk check-in.' });
  }

  try {
    // 0. Ambil foto referensi wajah user dari DB
    const userResult = await db.query('SELECT face_url FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data user tidak ditemukan' });
    }
    
    const registeredFaceUrl = userResult.rows[0].face_url;
    if (!registeredFaceUrl) {
      return res.status(400).json({ 
        message: 'Foto referensi wajah Anda belum terdaftar di sistem. Silakan hubungi HRD untuk mendaftarkan wajah Anda terlebih dahulu.' 
      });
    }

    // 1. Get Schedule & Rules
    const scheduleResult = await db.query('SELECT * FROM schedules WHERE id = $1', [schedule_id]);
    const rulesResult = await db.query('SELECT * FROM attendance_rules LIMIT 1');
    const rules = rulesResult.rows[0] || { tolerance_minutes: 15 };

    if (scheduleResult.rows.length === 0) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    const schedule = scheduleResult.rows[0];

    // 2. Calculate Late Minutes
    const nowJakartaStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const now = new Date(nowJakartaStr);
    const datePart = nowJakartaStr.split(',')[0];
    const shiftStart = new Date(datePart + ' ' + schedule.shift_start);
    let lateMinutes = 0;
    let status = 'hadir';

    const diff = (now - shiftStart) / (1000 * 60); // minutes
    const absentAfter = rules.absent_after_minutes ?? 60;

    // Tolak check-in jika sudah melewati batas alpha
    if (diff > absentAfter) {
      return res.status(403).json({
        message: `Check-in ditolak. Anda terlambat ${Math.floor(diff)} menit, melewati batas maksimal ${absentAfter} menit. Status hari ini: Alpha.`
      });
    }

    if (diff > rules.tolerance_minutes) {
      lateMinutes = Math.floor(diff);
      status = 'terlambat';
    }

    // 3. Upload selfie ke Firebase Storage
    const timestamp = Date.now();
    const destPath = `selfies/user_${user_id}_${timestamp}_checkin.jpg`;
    console.log(`[Attendance Controller] Uploading check-in selfie for user ${user_id}...`);
    const selfieUrl = await uploadToStorage(req.file.buffer, destPath, req.file.mimetype);

    // 4. Verifikasi Wajah menggunakan Azure Face API
    console.log(`[Attendance Controller] Verifying check-in face for user ${user_id}...`);
    const verification = await verifyFaces(registeredFaceUrl, selfieUrl);
    if (!verification.isMatch) {
      return res.status(403).json({ 
        message: `Verifikasi wajah gagal. Wajah Anda tidak cocok dengan foto referensi terdaftar (Confidence: ${(verification.confidence * 100).toFixed(1)}%).` 
      });
    }
    console.log(`[Attendance Controller] Face verification success (Confidence: ${(verification.confidence * 100).toFixed(1)}%)`);

    // 5. Save to PostgreSQL
    const attendance = await db.query(
      'INSERT INTO attendances (user_id, schedule_id, check_in, status, late_minutes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [user_id, schedule_id, status, lateMinutes]
    );

    // 6. Save Logs to Firestore (NoSQL)
    await firestore.collection('selfie_logs').add({
      attendance_id: attendance.rows[0].id,
      user_id,
      selfie_url: selfieUrl,
      confidence_score: verification.confidence,
      type: 'check-in',
      timestamp: new Date()
    });

    await firestore.collection('gps_logs').add({
      attendance_id: attendance.rows[0].id,
      user_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      type: 'check-in',
      timestamp: new Date()
    });

    res.status(201).json(attendance.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server Error saat check-in' });
  }
};

// @desc    Check-out
exports.checkOut = async (req, res) => {
  const { attendance_id, latitude, longitude, liveness_score } = req.body;
  const user_id = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Foto selfie wajib dilampirkan untuk check-out.' });
  }

  try {
    // 0. Ambil foto referensi wajah user dari DB
    const userResult = await db.query('SELECT face_url FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Data user tidak ditemukan' });
    }
    
    const registeredFaceUrl = userResult.rows[0].face_url;
    if (!registeredFaceUrl) {
      return res.status(400).json({ 
        message: 'Foto referensi wajah Anda belum terdaftar di sistem. Silakan hubungi HRD untuk mendaftarkan wajah Anda terlebih dahulu.' 
      });
    }

    // 1. Upload selfie ke Firebase Storage
    const timestamp = Date.now();
    const destPath = `selfies/user_${user_id}_${timestamp}_checkout.jpg`;
    console.log(`[Attendance Controller] Uploading check-out selfie for user ${user_id}...`);
    const selfieUrl = await uploadToStorage(req.file.buffer, destPath, req.file.mimetype);

    // 2. Verifikasi Wajah menggunakan Azure Face API
    console.log(`[Attendance Controller] Verifying check-out face for user ${user_id}...`);
    const verification = await verifyFaces(registeredFaceUrl, selfieUrl);
    if (!verification.isMatch) {
      return res.status(403).json({ 
        message: `Verifikasi wajah gagal. Wajah Anda tidak cocok dengan foto referensi terdaftar (Confidence: ${(verification.confidence * 100).toFixed(1)}%).` 
      });
    }
    console.log(`[Attendance Controller] Face verification success (Confidence: ${(verification.confidence * 100).toFixed(1)}%)`);

    // 3. Update attendance with check-out time in PostgreSQL
    const result = await db.query(
      'UPDATE attendances SET check_out = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [attendance_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data presensi tidak ditemukan' });
    }

    // 4. Save Check-out Logs to Firestore
    await firestore.collection('selfie_logs').add({
      attendance_id: parseInt(attendance_id),
      user_id,
      selfie_url: selfieUrl,
      confidence_score: verification.confidence,
      type: 'check-out',
      timestamp: new Date()
    });

    await firestore.collection('gps_logs').add({
      attendance_id: parseInt(attendance_id),
      user_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      type: 'check-out',
      timestamp: new Date()
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server Error saat check-out' });
  }
};

// @desc    Get attendance history
exports.getHistory = async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD

    let query = `
      SELECT a.*, u.name as user_name, s.shift_start, s.shift_end 
      FROM attendances a 
      JOIN users u ON a.user_id = u.id 
      JOIN schedules s ON a.schedule_id = s.id
    `;
    let params = [];

    if (req.user.role !== 'hrd') {
      // Karyawan hanya lihat milik sendiri
      query += ' WHERE a.user_id = $1';
      params.push(req.user.id);
      if (date) {
        query += ' AND DATE((a.check_in AT TIME ZONE \'UTC\') AT TIME ZONE \'Asia/Jakarta\') = $2';
        params.push(date);
      }
    } else {
      // HRD bisa filter by date
      if (date) {
        query += ' WHERE DATE((a.check_in AT TIME ZONE \'UTC\') AT TIME ZONE \'Asia/Jakarta\') = $1';
        params.push(date);
      }
    }

    query += ' ORDER BY a.check_in DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Daily attendance summary for HRD
//          Returns ALL karyawan with a schedule today, including those who didn't check in (alpha)
exports.getDailySummary = async (req, res) => {
  if (req.user.role !== 'hrd') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  try {
    // Date param (YYYY-MM-DD), default = today in Asia/Jakarta
    const dateParam = req.query.date;
    const targetDate = dateParam
      ? new Date(dateParam + 'T00:00:00+07:00')
      : new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }).split(',')[0]);

    // day_of_week: 0=Sunday ... 6=Saturday
    const dayOfWeek = targetDate.getDay();
    const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Get attendance rules
    const rulesResult = await db.query('SELECT * FROM attendance_rules LIMIT 1');
    const rules = rulesResult.rows[0] || { tolerance_minutes: 15, absent_after_minutes: 60 };

    // Check if the target date is a national holiday
    const { isHoliday: isNationalHoliday, description: holidayDescription } = await checkHoliday(dateStr);

    // 2. Get all karyawan who have a schedule on this day (via department)
    //    LEFT JOIN attendance for that date
    const result = await db.query(`
      SELECT
        u.id          AS user_id,
        u.name        AS user_name,
        u.email,
        d.name        AS department_name,
        s.id          AS schedule_id,
        s.shift_start,
        s.shift_end,
        a.id          AS attendance_id,
        a.check_in,
        a.check_out,
        a.status,
        a.late_minutes
      FROM users u
      JOIN departments d ON u.department_id = d.id
      JOIN schedules s   ON s.department_id = d.id AND s.day_of_week = $1
      LEFT JOIN attendances a
        ON a.user_id = u.id
        AND a.schedule_id = s.id
        AND DATE((a.check_in AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta') = $2
      WHERE u.role = 'karyawan'
      ORDER BY u.name ASC
    `, [dayOfWeek, dateStr]);

    // 3. For each row without an attendance record, mark as alpha or libur
    const summary = result.rows.map(row => {
      if (!row.attendance_id) {
        return {
          user_id: row.user_id,
          user_name: row.user_name,
          email: row.email,
          department_name: row.department_name,
          schedule_id: row.schedule_id,
          shift_start: row.shift_start,
          shift_end: row.shift_end,
          attendance_id: null,
          check_in: null,
          check_out: null,
          status: isNationalHoliday ? 'libur' : 'alpha',
          late_minutes: 0,
          holiday_name: isNationalHoliday ? holidayDescription : null,
        };
      }
      return {
        user_id: row.user_id,
        user_name: row.user_name,
        email: row.email,
        department_name: row.department_name,
        schedule_id: row.schedule_id,
        shift_start: row.shift_start,
        shift_end: row.shift_end,
        attendance_id: row.attendance_id,
        check_in: row.check_in,
        check_out: row.check_out,
        status: row.status,
        late_minutes: row.late_minutes,
        holiday_name: isNationalHoliday ? holidayDescription : null,
      };
    });

    res.json({
      date: dateStr,
      day_of_week: dayOfWeek,
      is_holiday: isNationalHoliday,
      holiday_description: isNationalHoliday ? holidayDescription : null,
      tolerance_minutes: rules.tolerance_minutes,
      absent_after_minutes: rules.absent_after_minutes,
      total: summary.length,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Monthly attendance summary per employee (for HRD)
//          Returns each employee with counts: hadir, terlambat, alpha, izin/sakit
//          and a detail list of every scheduled working day that month
exports.getMonthlySummary = async (req, res) => {
  if (req.user.role !== 'hrd') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-12
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const userId = req.query.user_id ? parseInt(req.query.user_id) : null;

    // Build date range for the month (Asia/Jakarta)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Get all karyawan (optionally filtered)
    const usersResult = await db.query(
      `SELECT u.id, u.name, u.email, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'karyawan'
       ${userId ? 'AND u.id = $1' : ''}
       ORDER BY u.name ASC`,
      userId ? [userId] : []
    );

    // Get attendance rules
    const rulesResult = await db.query('SELECT * FROM attendance_rules LIMIT 1');
    const rules = rulesResult.rows[0] || { tolerance_minutes: 15, absent_after_minutes: 60 };

    // Get all national holidays for this month and year
    const holidaysMap = await getHolidaysMap(year, month);

    const result = [];

    for (const user of usersResult.rows) {
      // Get this user's department schedules (days_of_week they should work)
      const schedResult = await db.query(
        `SELECT s.id, s.day_of_week, s.shift_start, s.shift_end
         FROM schedules s
         JOIN departments d ON s.department_id = d.id
         JOIN users u ON u.department_id = d.id
         WHERE u.id = $1`,
        [user.id]
      );
      const schedulesByDay = {};
      for (const s of schedResult.rows) {
        schedulesByDay[s.day_of_week] = s;
      }

      // Get all attendance records for this user in the month
      const attResult = await db.query(
        `SELECT a.*
         FROM attendances a
         WHERE a.user_id = $1
           AND DATE((a.check_in AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta') BETWEEN $2 AND $3
         ORDER BY a.check_in ASC`,
        [user.id, startDate, endDate]
      );
      const attByDate = {};
      for (const a of attResult.rows) {
        const d = new Date(a.check_in).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD
        attByDate[d] = a;
      }

      // Also get approved leave requests in this period
      const leaveResult = await db.query(
        `SELECT lr.*
         FROM leave_requests lr
         WHERE lr.user_id = $1
           AND lr.status = 'approved'
           AND lr.start_date <= $3
           AND lr.end_date >= $2`,
        [user.id, startDate, endDate]
      );
      // Build a set of dates covered by approved leave
      const leaveDates = new Set();
      for (const lr of leaveResult.rows) {
        let cur = new Date(lr.start_date + 'T00:00:00');
        const end = new Date(lr.end_date + 'T00:00:00');
        while (cur <= end) {
          leaveDates.add(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      }

      // Walk through every day of the month
      const days = [];
      let countHadir = 0, countTerlambat = 0, countAlpha = 0, countIzin = 0, countLibur = 0;

      for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
        const sched = schedulesByDay[dayOfWeek];

        if (!sched) continue; // not a working day for this user

        const att = attByDate[dateStr];
        const onLeave = leaveDates.has(dateStr);
        const isNationalHoliday = holidaysMap.has(dateStr);
        const holidayDescription = isNationalHoliday ? holidaysMap.get(dateStr) : null;

        let status;
        if (onLeave) {
          status = att?.status || 'izin';
        } else if (att) {
          status = att.status;
        } else {
          // No attendance and no leave
          if (isNationalHoliday) {
            status = 'libur';
          } else {
            // No attendance, no leave, not a holiday = alpha (only if date has passed)
            const dayDate = new Date(dateStr + 'T23:59:59');
            status = dayDate < new Date() ? 'alpha' : 'upcoming';
          }
        }

        if (status === 'hadir')     countHadir++;
        else if (status === 'terlambat') countTerlambat++;
        else if (status === 'alpha') countAlpha++;
        else if (status === 'izin' || status === 'sakit') countIzin++;
        else if (status === 'libur') countLibur++;

        days.push({
          date: dateStr,
          day_of_week: dayOfWeek,
          shift_start: sched.shift_start,
          shift_end: sched.shift_end,
          check_in: att?.check_in || null,
          check_out: att?.check_out || null,
          status,
          late_minutes: att?.late_minutes || 0,
          holiday_name: holidayDescription,
        });
      }

      result.push({
        user_id: user.id,
        user_name: user.name,
        email: user.email,
        department_name: user.department_name,
        month,
        year,
        summary: {
          hadir: countHadir,
          terlambat: countTerlambat,
          alpha: countAlpha,
          izin_sakit: countIzin,
          libur: countLibur,
          total_work_days: days.length,
        },
        days,
      });
    }

    res.json({
      month,
      year,
      tolerance_minutes: rules.tolerance_minutes,
      absent_after_minutes: rules.absent_after_minutes,
      employees: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
