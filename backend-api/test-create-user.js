// Script untuk membuat user test
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'hayabusa88',
  database: 'db_presensi',
  host: 'localhost',
  port: 5432,
});

async function createTestUsers() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Buat HRD
    await pool.query(`
      INSERT INTO users (name, email, password, role, department_id) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin HRD', 'hrd@test.com', hashedPassword, 'hrd', 2]);

    // 2. Buat Karyawan
    await pool.query(`
      INSERT INTO users (name, email, password, role, department_id) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Budi Santoso', 'karyawan@test.com', hashedPassword, 'karyawan', 1]);

    // 3. Buat Karyawan 2
    await pool.query(`
      INSERT INTO users (name, email, password, role, department_id) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Siti Nurhaliza', 'siti@test.com', hashedPassword, 'karyawan', 1]);

    // 4. Buat jadwal untuk karyawan (user_id 2)
    await pool.query(`
      INSERT INTO schedules (user_id, day_of_week, shift_start, shift_end)
      VALUES 
        (2, 1, '08:00:00', '17:00:00'),
        (2, 2, '08:00:00', '17:00:00'),
        (2, 3, '08:00:00', '17:00:00'),
        (2, 4, '08:00:00', '17:00:00'),
        (2, 5, '08:00:00', '17:00:00')
      ON CONFLICT DO NOTHING
    `);

    // 5. Buat lokasi kantor
    await pool.query(`
      INSERT INTO work_locations (name, latitude, longitude, radius_meters)
      VALUES ('Kantor Pusat', -6.175110, 106.827153, 100)
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ User test berhasil dibuat!');
    console.log('\n📝 Kredensial Login:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HRD:');
    console.log('  Email: hrd@test.com');
    console.log('  Password: password123');
    console.log('\nKaryawan 1:');
    console.log('  Email: karyawan@test.com');
    console.log('  Password: password123');
    console.log('\nKaryawan 2:');
    console.log('  Email: siti@test.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Tampilkan semua user
    const users = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('📊 Daftar User di Database:');
    console.table(users.rows);

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
  }
}

createTestUsers();
