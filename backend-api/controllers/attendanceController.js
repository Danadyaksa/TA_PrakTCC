const db = require('../db');
const firestore = require('../firebase');

// @desc    Check-in
exports.checkIn = async (req, res) => {
  const { schedule_id, latitude, longitude, selfie_url, liveness_score } = req.body;
  const user_id = req.user.id;

  try {
    // 1. Get Schedule & Rules
    const scheduleResult = await db.query('SELECT * FROM schedules WHERE id = $1', [schedule_id]);
    const rulesResult = await db.query('SELECT * FROM attendance_rules LIMIT 1');
    const rules = rulesResult.rows[0] || { tolerance_minutes: 15 };

    if (scheduleResult.rows.length === 0) return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    const schedule = scheduleResult.rows[0];

    // 2. Calculate Late Minutes
    const now = new Date();
    const shiftStart = new Date(now.toDateString() + ' ' + schedule.shift_start);
    let lateMinutes = 0;
    let status = 'hadir';

    const diff = (now - shiftStart) / (1000 * 60); // minutes
    if (diff > rules.tolerance_minutes) {
      lateMinutes = Math.floor(diff);
      status = 'terlambat';
    }

    // 3. Save to PostgreSQL
    const attendance = await db.query(
      'INSERT INTO attendances (user_id, schedule_id, check_in, status, late_minutes) VALUES ($1, $2, NOW(), $3, $4) RETURNING *',
      [user_id, schedule_id, status, lateMinutes]
    );

    // 4. Save Logs to Firestore (NoSQL)
    await firestore.collection('selfie_logs').add({
      attendance_id: attendance.rows[0].id,
      user_id,
      selfie_url,
      timestamp: new Date()
    });

    await firestore.collection('gps_logs').add({
      attendance_id: attendance.rows[0].id,
      user_id,
      latitude,
      longitude,
      timestamp: new Date()
    });

    res.status(201).json(attendance.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check-out
exports.checkOut = async (req, res) => {
  const { attendance_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE attendances SET check_out = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [attendance_id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get attendance history
exports.getHistory = async (req, res) => {
  try {
    let query = 'SELECT a.*, u.name as user_name, s.shift_start, s.shift_end FROM attendances a JOIN users u ON a.user_id = u.id JOIN schedules s ON a.schedule_id = s.id';
    let params = [];
    
    if (req.user.role !== 'hrd') {
      query += ' WHERE a.user_id = $1';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY a.check_in DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
