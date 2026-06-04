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

// @desc    Get active approved leave for today (karyawan)
exports.getActiveLeave = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const result = await db.query(
      `SELECT * FROM leave_requests 
       WHERE user_id = $1 
         AND status = 'approved' 
         AND start_date <= $2 
         AND end_date >= $2
       ORDER BY start_date DESC
       LIMIT 1`,
      [req.user.id, today]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get leave requests
exports.getLeaves = async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = 'SELECT l.*, u.name as user_name FROM leave_requests l JOIN users u ON l.user_id = u.id WHERE 1=1';
    let params = [];

    if (req.user.role !== 'hrd') {
      params.push(req.user.id);
      query += ` AND l.user_id = $${params.length}`;
    }

    if (month && year) {
      params.push(parseInt(year));
      query += ` AND EXTRACT(YEAR FROM l.start_date) = $${params.length}`;
      params.push(parseInt(month));
      query += ` AND EXTRACT(MONTH FROM l.start_date) = $${params.length}`;
    } else if (year) {
      params.push(parseInt(year));
      query += ` AND EXTRACT(YEAR FROM l.start_date) = $${params.length}`;
    }

    query += ' ORDER BY l.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
