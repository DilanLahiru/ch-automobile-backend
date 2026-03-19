const express = require('express');
const {createServiceType, getServiceTypes} = require('../controllers/serviceTypeController');
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/create', authMiddleware, createServiceType);
router.get('/all', authMiddleware, getServiceTypes);

module.exports = router;