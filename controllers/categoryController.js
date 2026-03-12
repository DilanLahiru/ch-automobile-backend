const categoryModel = require("../models/categoryModel");

const createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const category = new categoryModel({
            name,
        });
        const savedCategory = await category.save();
        res.status(201).json({
            message: 'Category created successfully',
            category: savedCategory,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating category' });
    }
};

// Load All Categories
const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category' });
    }
};

module.exports = { createCategory, getCategories, getCategoryById };