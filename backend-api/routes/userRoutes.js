const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('hrd')); // Hanya HRD yang bisa kelola user

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
