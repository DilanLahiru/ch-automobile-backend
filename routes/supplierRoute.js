const express = require('express');
const {createSupplier, getSuppliers} = require('../controllers/supplierController');

const router = express.Router();

router.post('/create', createSupplier);
router.get('/all', getSuppliers);

module.exports = router;