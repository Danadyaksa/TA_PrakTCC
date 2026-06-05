const db = require('../db');

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// @desc    Get all schedules grouped by department
exports.getSchedules = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, d.name as department_name
      FROM schedules s
      JOIN departments d ON s.department_id = d.id
      ORDER BY d.name, s.day_of_week
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get MY schedules (by department of logged-in user)
exports.getMySchedules = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil department_id user
    const userResult = await db.query('SELECT department_id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const departmentId = userResult.rows[0].department_id;
    if (!departmentId) {
      return res.json([]); // User belum punya departemen
    }

    const result = await db.query(
      'SELECT * FROM schedules WHERE department_id = $1 ORDER BY day_of_week',
      [departmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting my schedules:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Init schedules for a department (Senin-Jumat default 08:00-16:00)
exports.initDepartmentSchedule = async (req, res) => {
  const { department_id } = req.body;
  try {
    // Cek sudah ada belum
    const existing = await db.query(
      'SELECT id FROM schedules WHERE department_id = $1',
      [department_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Jadwal departemen sudah ada' });
    }

    // Buat Senin-Jumat (1-5)
    for (let day = 1; day <= 6; day++) {
      await db.query(
        'INSERT INTO schedules (department_id, day_of_week, shift_start, shift_end) VALUES ($1, $2, $3, $4)',
        [department_id, day, '08:00:00', '16:00:00']
      );
    }

    const result = await db.query(
      'SELECT s.*, d.name as department_name FROM schedules s JOIN departments d ON s.department_id = d.id WHERE s.department_id = $1 ORDER BY s.day_of_week',
      [department_id]
    );
    res.status(201).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a single schedule slot (shift_start + shift_end only)
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { shift_start, shift_end } = req.body;
  try {
    const result = await db.query(
      'UPDATE schedules SET shift_start = $1, shift_end = $2 WHERE id = $3 RETURNING *',
      [shift_start, shift_end, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete all schedules for a department
exports.deleteDepartmentSchedule = async (req, res) => {
  const { department_id } = req.params;
  try {
    await db.query('DELETE FROM schedules WHERE department_id = $1', [department_id]);
    res.json({ message: 'Jadwal departemen dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Legacy — kept for compatibility, not used in new flow
exports.createSchedule = async (req, res) => {
  return res.status(400).json({ message: 'Gunakan endpoint init-department' });
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
