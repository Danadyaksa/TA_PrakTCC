const express = require('express');
const router = express.Router();
const { getLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLocations);
router.post('/', authorize('hrd'), createLocation);
router.put('/:id', authorize('hrd'), updateLocation);
router.delete('/:id', authorize('hrd'), deleteLocation);

module.exports = router;
