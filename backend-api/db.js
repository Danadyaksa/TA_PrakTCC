const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('🐘 PostgreSQL Connected!');
});

// Pastikan kolom face_url ada di tabel users
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS face_url TEXT')
  .then(() => console.log('👤 Kolom face_url dipastikan ada di tabel users.'))
  .catch(err => console.error('⚠️ Gagal memverifikasi kolom face_url:', err));

// Pastikan kolom basic_salary ada di tabel departments
pool.query('ALTER TABLE departments ADD COLUMN IF NOT EXISTS basic_salary DECIMAL(15, 2) DEFAULT 0')
  .then(() => console.log('🏢 Kolom basic_salary dipastikan ada di tabel departments.'))
  .catch(err => console.error('⚠️ Gagal memverifikasi kolom basic_salary di tabel departments:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
