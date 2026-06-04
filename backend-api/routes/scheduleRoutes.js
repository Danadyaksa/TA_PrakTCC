const express = require('express');
const router = express.Router();
const {
  getSchedules,
  getMySchedules,
  initDepartmentSchedule,
  updateSchedule,
  deleteDepartmentSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getSchedules);
router.get('/my', getMySchedules);
router.post('/init-department', authorize('hrd'), initDepartmentSchedule);
router.put('/:id', authorize('hrd'), updateSchedule);
router.delete('/department/:department_id', authorize('hrd'), deleteDepartmentSchedule);
router.delete('/:id', authorize('hrd'), deleteSchedule);

module.exports = router;
