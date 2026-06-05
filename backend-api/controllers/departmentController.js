const db = require('../db');

// @desc    Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create department
exports.createDepartment = async (req, res) => {
  const { name, description, basic_salary } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO departments (name, description, basic_salary) VALUES ($1, $2, $3) RETURNING *',
      [name, description, basic_salary || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description, basic_salary } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name = $1, description = $2, basic_salary = $3 WHERE id = $4 RETURNING *',
      [name, description, basic_salary || 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
