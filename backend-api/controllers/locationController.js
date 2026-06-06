const db = require('../db');

exports.getLocations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM work_locations ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createLocation = async (req, res) => {
  const { name, latitude, longitude, radius_meters } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO work_locations (name, latitude, longitude, radius_meters) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, latitude, longitude, radius_meters]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, radius_meters } = req.body;
  try {
    const result = await db.query(
      'UPDATE work_locations SET name = $1, latitude = $2, longitude = $3, radius_meters = $4 WHERE id = $5 RETURNING *',
      [name, latitude, longitude, radius_meters, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteLocation = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM work_locations WHERE id = $1', [id]);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
