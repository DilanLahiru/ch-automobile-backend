const express = require('express');
const router = express.Router();

const { createOldServiceRecord, getOldServiceRecords } = require('../controllers/oldServiceRecordController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createOldServiceRecord);
router.get('/all', authMiddleware, getOldServiceRecords);

module.exports = router;