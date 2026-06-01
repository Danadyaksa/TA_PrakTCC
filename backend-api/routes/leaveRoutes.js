const express = require('express');
const router = express.Router();
const { applyLeave, updateLeaveStatus, getLeaves } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaves);
router.post('/', applyLeave);
router.put('/:id/status', authorize('hrd'), updateLeaveStatus);

module.exports = router;
