const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role, department_id } = req.body;

  try {
    // 1. Cek apakah user sudah ada
    const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan ke Database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'karyawan', department_id]
    );

    res.status(201).json({
      message: 'User berhasil didaftarkan',
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saat registrasi' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Cari User
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Email atau Password salah' });
    }

    const user = userResult.rows[0];

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau Password salah' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saat login' });
  }
};
