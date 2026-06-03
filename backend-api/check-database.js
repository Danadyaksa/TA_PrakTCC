// Script untuk cek database dan tabel yang ada
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'hayabusa88',
  database: 'db_presensi',
  host: 'localhost',
  port: 5432,
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database Connection...\n');

    // 1. Cek koneksi
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection: OK\n');

    // 2. Cek tabel yang ada
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Tables in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (tables.rows.length === 0) {
      console.log('❌ No tables found! Database belum di-setup!');
      console.log('\n💡 Solusi: Run schema SQL file');
      console.log('   psql -U postgres -d db_presensi -f karyawan.sql');
    } else {
      tables.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.table_name}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 3. Cek jumlah data di setiap tabel
    if (tables.rows.length > 0) {
      console.log('📈 Data Count per Table:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const table of tables.rows) {
        const tableName = table.table_name;
        try {
          const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
          console.log(`${tableName.padEnd(25)} : ${count.rows[0].count} rows`);
        } catch (err) {
          console.log(`${tableName.padEnd(25)} : Error (${err.message})`);
        }
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // 4. Cek user yang ada
    try {
      const users = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
      if (users.rows.length > 0) {
        console.log('👥 Users in database:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.table(users.rows);
      } else {
        console.log('⚠️  No users found! Run test-create-user.js to create test users.');
      }
    } catch (err) {
      console.log('❌ Cannot query users table:', err.message);
    }

    // 5. Cek work locations
    try {
      const locations = await pool.query('SELECT * FROM work_locations');
      if (locations.rows.length > 0) {
        console.log('\n📍 Work Locations:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.table(locations.rows);
      } else {
        console.log('\n⚠️  No work locations found!');
      }
    } catch (err) {
      console.log('❌ Cannot query work_locations table:', err.message);
    }

    // 6. Cek schedules
    try {
      const schedules = await pool.query(`
        SELECT s.id, u.name as user_name, s.day_of_week, s.shift_start, s.shift_end 
        FROM schedules s 
        JOIN users u ON s.user_id = u.id 
        ORDER BY s.user_id, s.day_of_week
      `);
      if (schedules.rows.length > 0) {
        console.log('\n📅 Schedules:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.table(schedules.rows);
      } else {
        console.log('\n⚠️  No schedules found!');
      }
    } catch (err) {
      console.log('❌ Cannot query schedules table:', err.message);
    }

    await pool.end();
    
    console.log('\n✅ Database check complete!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\n💡 Possible issues:');
    console.error('   1. PostgreSQL service not running');
    console.error('   2. Database "db_presensi" does not exist');
    console.error('   3. Wrong credentials in .env file');
    console.error('\n🔧 Solutions:');
    console.error('   1. Start PostgreSQL service');
    console.error('   2. Create database: CREATE DATABASE db_presensi;');
    console.error('   3. Run schema: psql -U postgres -d db_presensi -f karyawan.sql');
    await pool.end();
  }
}

checkDatabase();
