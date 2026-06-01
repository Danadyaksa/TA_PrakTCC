const express = require('express');
const router = express.Router();
const { getRules, updateRules } = require('../controllers/ruleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRules);
router.put('/', authorize('hrd'), updateRules);

module.exports = router;
