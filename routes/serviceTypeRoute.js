const express = require('express');
const {createServiceType, getServiceTypes, updateServiceType} = require('../controllers/serviceTypeController');
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/create', authMiddleware, createServiceType);
router.get('/all', authMiddleware, getServiceTypes);
router.put('/update/:id', authMiddleware, updateServiceType);

module.exports = router;