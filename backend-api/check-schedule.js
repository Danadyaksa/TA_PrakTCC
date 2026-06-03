const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'hayabusa88',
  database: 'db_presensi',
  host: 'localhost',
  port: 5432,
});

async function checkSchedules() {
  try {
    // Cek jadwal untuk user karyawan@test.com (id=4)
    const schedules = await pool.query(`
      SELECT s.*, u.name, u.email 
      FROM schedules s 
      JOIN users u ON s.user_id = u.id 
      WHERE u.email = 'karyawan@test.com'
      ORDER BY s.day_of_week
    `);

    console.log('📅 Jadwal untuk karyawan@test.com:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (schedules.rows.length === 0) {
      console.log('❌ TIDAK ADA JADWAL!');
      console.log('\n💡 Solusi: Buat jadwal untuk user ini');
      console.log('   User ID: 4 (karyawan@test.com)');
    } else {
      console.table(schedules.rows);
      
      // Cek hari ini (0=Sunday, 1=Monday, dst)
      const today = new Date().getDay();
      const todaySchedule = schedules.rows.find(s => s.day_of_week === today);
      
      console.log(`\n📆 Hari ini: ${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][today]}`);
      
      if (todaySchedule) {
        console.log(`✅ Ada jadwal: ${todaySchedule.shift_start} - ${todaySchedule.shift_end}`);
      } else {
        console.log('⚠️  Tidak ada jadwal untuk hari ini');
      }
    }

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
  }
}

checkSchedules();
