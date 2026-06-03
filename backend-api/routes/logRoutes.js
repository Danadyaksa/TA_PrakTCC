const express = require('express');
const router = express.Router();
const { saveMobileError, createNotification } = require('../controllers/logController');

// Endpoint untuk Mobile mencatat error
router.post('/error', saveMobileError);

// Endpoint untuk HRD mengirim notifikasi pengumuman
router.post('/notification', createNotification);

module.exports = router;