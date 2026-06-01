const db = require('../db');

// @desc    Get salaries
exports.getSalaries = async (req, res) => {
  try {
    let query = 'SELECT s.*, u.name as user_name FROM salaries s JOIN users u ON s.user_id = u.id';
    let params = [];
    if (req.user.role !== 'hrd') {
      query += ' WHERE s.user_id = $1';
      params.push(req.user.id);
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create salary (HRD)
exports.createSalary = async (req, res) => {
  const { user_id, month, year, basic_salary, allowances, deductions } = req.body;
  const net_salary = parseFloat(basic_salary) + parseFloat(allowances || 0) - parseFloat(deductions || 0);
  try {
    const result = await db.query(
      'INSERT INTO salaries (user_id, month, year, basic_salary, allowances, deductions, net_salary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, month, year, basic_salary, allowances, deductions, net_salary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
