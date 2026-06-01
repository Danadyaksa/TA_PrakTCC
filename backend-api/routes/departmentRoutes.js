const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // Semua route butuh login

router.get('/', getDepartments);
router.post('/', authorize('hrd'), createDepartment);
router.put('/:id', authorize('hrd'), updateDepartment);
router.delete('/:id', authorize('hrd'), deleteDepartment);

module.exports = router;
