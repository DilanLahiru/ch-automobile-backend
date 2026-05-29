const express = require('express');
const {createOtherCharge, getOtherCharges, updateOtherCharge} = require('../controllers/otherChargeController');
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/create', authMiddleware, createOtherCharge);
router.get('/all', authMiddleware, getOtherCharges);
router.put('/update/:id', authMiddleware, updateOtherCharge);

module.exports = router;