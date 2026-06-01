const express = require('express');
const router = express.Router();
const { getSalaries, createSalary } = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSalaries);
router.post('/', authorize('hrd'), createSalary);

module.exports = router;
