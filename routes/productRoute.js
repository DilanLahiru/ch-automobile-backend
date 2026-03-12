const express = require('express');
const {createProduct, getProducts} = require('../controllers/productController');

const router = express.Router();

router.post('/create', createProduct);
router.get('/all', getProducts);

module.exports = router;