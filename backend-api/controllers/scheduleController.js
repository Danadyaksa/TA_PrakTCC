const db = require('../db');

// @desc    Get schedules for a user or all
exports.getSchedules = async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT s.*, u.name as user_name FROM schedules s JOIN users u ON s.user_id = u.id';
    let params = [];
    if (userId) {
      query += ' WHERE s.user_id = $1';
      params.push(userId);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create schedule
exports.createSchedule = async (req, res) => {
  const { user_id, day_of_week, shift_start, shift_end } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO schedules (user_id, day_of_week, shift_start, shift_end) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, day_of_week, shift_start, shift_end]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update schedule
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { day_of_week, shift_start, shift_end } = req.body;
  try {
    const result = await db.query(
      'UPDATE schedules SET day_of_week = $1, shift_start = $2, shift_end = $3 WHERE id = $4 RETURNING *',
      [day_of_week, shift_start, shift_end, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete schedule
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
