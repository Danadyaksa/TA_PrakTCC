const express = require('express');
const router = express.Router();
const { applyLeave, updateLeaveStatus, getLeaves, getActiveLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaves);
router.get('/active-today', getActiveLeave);
router.post('/', applyLeave);
router.put('/:id/status', authorize('hrd'), updateLeaveStatus);

module.exports = router;
