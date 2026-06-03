const db = require('../config/firebase');

// 1. Menyimpan Mobile Error Log (Otomatis membuat collection 'mobile_error_logs')
const saveMobileError = async (req, res) => {
  try {
    const { user_id, error_type, message } = req.body;
    
    const docRef = await db.collection('mobile_error_logs').add({
      user_id: user_id || 'unknown',
      error_type: error_type,
      message: message,
      timestamp: new Date()
    });

    res.status(201).json({ success: true, id: docRef.id, message: "Error log berhasil dicatat di Firestore" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Mengirim Notifikasi Real-time (Otomatis membuat collection 'notifications')
const createNotification = async (req, res) => {
  try {
    const { title, message, target_user_id } = req.body;
    
    const docRef = await db.collection('notifications').add({
      title: title,
      message: message,
      target_user_id: target_user_id || "all", // isi "all" jika broadcast ke semua
      is_read: false,
      created_at: new Date()
    });

    res.status(201).json({ success: true, id: docRef.id, message: "Notifikasi berhasil dikirim" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  saveMobileError,
  createNotification
};