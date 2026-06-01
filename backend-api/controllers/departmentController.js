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
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
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
