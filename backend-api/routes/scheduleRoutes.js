const express = require('express');
const router = express.Router();
const { getSchedules, getMySchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSchedules);
router.get('/my', getMySchedules); // Endpoint baru untuk karyawan
router.post('/', authorize('hrd'), createSchedule);
router.put('/:id', authorize('hrd'), updateSchedule);
router.delete('/:id', authorize('hrd'), deleteSchedule);

module.exports = router;
