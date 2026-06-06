const db = require('../db');
const { clearHolidaysCache } = require('../utils/holidayHelper');

exports.getHolidays = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM holidays ORDER BY holiday_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createHoliday = async (req, res) => {
  const { holiday_date, description } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO holidays (holiday_date, description) 
       VALUES ($1, $2) 
       ON CONFLICT (holiday_date) 
       DO UPDATE SET description = EXCLUDED.description 
       RETURNING *`,
      [holiday_date, description]
    );

    // Invalidate holidays cache
    clearHolidaysCache();

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { holiday_date, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE holidays SET holiday_date = $1, description = $2 WHERE id = $3 RETURNING *',
      [holiday_date, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    // Invalidate holidays cache
    clearHolidaysCache();

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM holidays WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    // Invalidate holidays cache
    clearHolidaysCache();

    res.json({ message: 'Holiday deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
