const express = require('express');
const {createCategory, getCategories, getCategoryById, updateCategoryById} = require('../controllers/categoryController');

const router = express.Router();

router.post('/create', createCategory);
router.get('/load', getCategories);
router.get('/:id', getCategoryById);
router.put('/update/:id', updateCategoryById);

module.exports = router;