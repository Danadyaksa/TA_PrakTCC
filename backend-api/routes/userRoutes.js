const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, registerFace } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(authorize('hrd')); // Hanya HRD yang bisa kelola user

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/face', upload.single('face_image'), registerFace);

module.exports = router;
