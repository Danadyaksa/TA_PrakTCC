const express = require('express');
const router = express.Router();
const { getHolidays, createHoliday, updateHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('hrd'), createHoliday);
router.put('/:id', authorize('hrd'), updateHoliday);
router.delete('/:id', authorize('hrd'), deleteHoliday);

module.exports = router;
