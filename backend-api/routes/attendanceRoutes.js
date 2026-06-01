const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getHistory } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/history', getHistory);

module.exports = router;
