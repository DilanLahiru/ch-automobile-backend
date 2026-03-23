/**
 * Product Controller
 * Handles product CRUD operations
 */

const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const supplierModel = require("../models/supplierModel");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../utils/validation");

/**
 * Create a new product
 * POST /api/product/create
 */
const createProduct = async (req, res, next) => {
    try {
        const { name, supplierId, categoryId, price, quantity, initialStock, minimumStock } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { name, supplierId, categoryId, price, quantity, initialStock, minimumStock },
            ['name', 'supplierId', 'categoryId', 'price', 'quantity', 'initialStock', 'minimumStock']
        );

        if (!validation.isValid) {
            logger.warn('Product creation: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Validate numeric fields
        if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
            logger.warn('Product creation: Invalid numeric values', { price, quantity });
            return next(new AppError('Price must be positive and quantity must be non-negative', 400));
        }

        // Check supplier and category existence
        const [supplier, category] = await Promise.all([
            supplierModel.findById(supplierId),
            categoryModel.findById(categoryId),
        ]);

        if (!supplier || !category) {
            logger.warn('Product creation: Supplier or category not found', { supplierId, categoryId });
            return next(new AppError('Supplier or Category not found', 404));
        }

        // Create product
        const product = new productModel({
            name: name.trim(),
            supplierId,
            categoryId,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            initialStock: parseInt(initialStock),
            minimumStock: parseInt(minimumStock),
            categoryName: category.name,
            supplierName: supplier.name,
        });

        const savedProduct = await product.save();
        logger.info('Product created successfully', { productId: savedProduct._id, name });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product: savedProduct },
        });
    } catch (error) {
        logger.error('Error creating product', error);
        next(error);
    }
};

/**
 * Get all products (paginated)
 * GET /api/product
 */
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, categoryId, supplierId } = req.query;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (categoryId) filter.categoryId = categoryId;
        if (supplierId) filter.supplierId = supplierId;

        const products = await productModel.find(filter)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await productModel.countDocuments(filter);

        logger.info('Products fetched successfully', { count: products.length, total });

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: {
                products,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching products', error);
        next(error);
    }
};

/**
 * Get product by ID
 * GET /api/product/:id
 */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Product fetch: No ID provided');
            return next(new AppError('Product ID is required', 400));
        }

        const product = await productModel.findById(id);

        if (!product) {
            logger.warn('Product fetch: Product not found', { id });
            return next(new AppError('Product not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: { product },
        });
    } catch (error) {
        logger.error('Error fetching product', error);
        next(error);
    }
};

/**
 * Update product
 * PUT /api/product/:id
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            logger.warn('Product update: No ID provided');
            return next(new AppError('Product ID is required', 400));
        }

        // Find and update product
        const product = await productModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!product) {
            logger.warn('Product update: Product not found', { id });
            return next(new AppError('Product not found', 404));
        }

        logger.info('Product updated successfully', { productId: id });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    } catch (error) {
        logger.error('Error updating product', error);
        next(error);
    }
};

/**
 * Delete product
 * DELETE /api/product/:id
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Product delete: No ID provided');
            return next(new AppError('Product ID is required', 400));
        }

        const product = await productModel.findByIdAndDelete(id);

        if (!product) {
            logger.warn('Product delete: Product not found', { id });
            return next(new AppError('Product not found', 404));
        }

        logger.info('Product deleted successfully', { productId: id });

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: { product },
        });
    } catch (error) {
        logger.error('Error deleting product', error);
        next(error);
    }
};

module.exports = { 
    createProduct, 
    getProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct 
};