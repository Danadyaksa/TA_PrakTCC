const db = require('../db');
const bcrypt = require('bcryptjs');
const { uploadToStorage } = require('../utils/storageHelper');

// @desc    Get all users (employees)
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT u.id, u.name, u.email, u.role, u.department_id, u.face_url, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id ORDER BY u.name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new user (by HRD)
exports.createUser = async (req, res) => {
  const { name, email, password, role, department_id } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (name, email, password, role, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, role, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, department_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, department_id = $3 WHERE id = $4 RETURNING id, name, email, role, department_id',
      [name, email, department_id || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register / update user face reference photo
exports.registerFace = async (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Harap lampirkan file gambar wajah (face_image).' });
  }

  try {
    // 1. Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // 2. Upload to Firebase Storage
    const timestamp = Date.now();
    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const destPath = `faces/user_${id}_${timestamp}.${ext}`;
    
    console.log(`[User Controller] Uploading face photo for user ${id} to Firebase Storage...`);
    const faceUrl = await uploadToStorage(req.file.buffer, destPath, req.file.mimetype);

    // 3. Update PostgreSQL
    await db.query('UPDATE users SET face_url = $1 WHERE id = $2', [faceUrl, id]);

    res.json({
      message: 'Foto referensi wajah berhasil didaftarkan!',
      face_url: faceUrl
    });
  } catch (err) {
    console.error('[User Controller] Error registering face:', err);
    res.status(500).json({ message: 'Server Error saat mendaftarkan wajah' });
  }
};
