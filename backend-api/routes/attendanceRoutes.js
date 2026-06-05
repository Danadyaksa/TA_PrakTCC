const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getHistory, getDailySummary, getMonthlySummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/check-in', upload.single('selfie'), checkIn);
router.post('/check-out', upload.single('selfie'), checkOut);
router.get('/history', getHistory);
router.get('/daily-summary', getDailySummary);
router.get('/monthly-summary', getMonthlySummary);

module.exports = router;
