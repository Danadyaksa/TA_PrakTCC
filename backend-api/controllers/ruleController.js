const db = require('../db');

// @desc    Get rules
exports.getRules = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM attendance_rules LIMIT 1');
    res.json(result.rows[0] || { tolerance_minutes: 15, absent_after_minutes: 60 });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update rules
exports.updateRules = async (req, res) => {
  const { tolerance_minutes, absent_after_minutes } = req.body;
  try {
    // Check if exists
    const check = await db.query('SELECT id FROM attendance_rules LIMIT 1');
    let result;
    if (check.rows.length === 0) {
      result = await db.query(
        'INSERT INTO attendance_rules (tolerance_minutes, absent_after_minutes) VALUES ($1, $2) RETURNING *',
        [tolerance_minutes, absent_after_minutes]
      );
    } else {
      result = await db.query(
        'UPDATE attendance_rules SET tolerance_minutes = $1, absent_after_minutes = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [tolerance_minutes, absent_after_minutes, check.rows[0].id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
