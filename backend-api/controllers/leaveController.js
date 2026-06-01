const db = require('../db');

// @desc    Apply for leave
exports.applyLeave = async (req, res) => {
  const { type, start_date, end_date, reason } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO leave_requests (user_id, type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, type, start_date, end_date, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve/Reject leave (HRD)
exports.updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
      'UPDATE leave_requests SET status = $1, approved_by = $2 WHERE id = $3 RETURNING *',
      [status, req.user.id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get leave requests
exports.getLeaves = async (req, res) => {
  try {
    let query = 'SELECT l.*, u.name as user_name FROM leave_requests l JOIN users u ON l.user_id = u.id';
    let params = [];
    if (req.user.role !== 'hrd') {
      query += ' WHERE l.user_id = $1';
      params.push(req.user.id);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
