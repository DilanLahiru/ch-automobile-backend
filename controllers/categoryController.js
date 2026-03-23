/**
 * Category Controller
 * Handles category CRUD operations
 */

const categoryModel = require("../models/categoryModel");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../utils/validation");

/**
 * Create a new category
 * POST /api/category/create
 */
const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        // Validate required fields
        const validation = validateRequiredFields({ name }, ['name']);

        if (!validation.isValid) {
            logger.warn('Category creation: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Check for duplicate category name
        const existingCategory = await categoryModel.findOne({ name: name.toLowerCase().trim() });
        if (existingCategory) {
            logger.warn('Category creation: Category already exists', { name });
            return next(new AppError('Category already exists', 400));
        }

        // Create category
        const category = new categoryModel({
            name: name.trim(),
        });

        const savedCategory = await category.save();
        logger.info('Category created successfully', { categoryId: savedCategory._id, name });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category: savedCategory },
        });
    } catch (error) {
        logger.error('Error creating category', error);
        next(error);
    }
};

/**
 * Get all categories (paginated)
 * GET /api/category
 */
const getCategories = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const categories = await categoryModel.find()
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await categoryModel.countDocuments();

        logger.info('Categories fetched successfully', { count: categories.length, total });

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: {
                categories,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching categories', error);
        next(error);
    }
};

/**
 * Get category by ID
 * GET /api/category/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Category fetch: No ID provided');
            return next(new AppError('Category ID is required', 400));
        }

        const category = await categoryModel.findById(id);

        if (!category) {
            logger.warn('Category fetch: Category not found', { id });
            return next(new AppError('Category not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: { category },
        });
    } catch (error) {
        logger.error('Error fetching category', error);
        next(error);
    }
};

/**
 * Update category
 * PUT /api/category/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!id) {
            logger.warn('Category update: No ID provided');
            return next(new AppError('Category ID is required', 400));
        }

        if (!name) {
            logger.warn('Category update: Missing name field');
            return next(new AppError('Category name is required', 400));
        }

        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );

        if (!category) {
            logger.warn('Category update: Category not found', { id });
            return next(new AppError('Category not found', 404));
        }

        logger.info('Category updated successfully', { categoryId: id });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: { category },
        });
    } catch (error) {
        logger.error('Error updating category', error);
        next(error);
    }
};

/**
 * Delete category
 * DELETE /api/category/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Category delete: No ID provided');
            return next(new AppError('Category ID is required', 400));
        }

        const category = await categoryModel.findByIdAndDelete(id);

        if (!category) {
            logger.warn('Category delete: Category not found', { id });
            return next(new AppError('Category not found', 404));
        }

        logger.info('Category deleted successfully', { categoryId: id });

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: { category },
        });
    } catch (error) {
        logger.error('Error deleting category', error);
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};