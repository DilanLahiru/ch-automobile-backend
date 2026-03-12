const express = require('express');
const {createCategory, getCategories, getCategoryById} = require('../controllers/categoryController');

const router = express.Router();

router.post('/create', createCategory);
router.get('/load', getCategories);
router.get('/:id', getCategoryById);

module.exports = router;