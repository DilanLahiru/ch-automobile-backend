/**
 * Supplier Controller
 * Handles supplier CRUD operations
 */

const supplierModel = require("../models/supplierModel");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validatePhoneNumber, validateRequiredFields } = require("../utils/validation");

/**
 * Create a new supplier
 * POST /api/supplier/create
 */
const createSupplier = async (req, res, next) => {
    try {
        const { name, contactNumber } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { name, contactNumber },
            ['name', 'contactNumber']
        );

        if (!validation.isValid) {
            logger.warn('Supplier creation: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Validate phone number format
        if (!validatePhoneNumber(contactNumber)) {
            logger.warn('Supplier creation: Invalid phone number', { contactNumber });
            return next(new AppError('Invalid contact number format', 400));
        }

        // Check for duplicate contact number
        const existingSupplier = await supplierModel.findOne({ contactNumber: contactNumber.trim() });
        if (existingSupplier) {
            logger.warn('Supplier creation: Contact number already exists', { contactNumber });
            return next(new AppError('Contact number already registered', 400));
        }

        // Create supplier
        const supplier = new supplierModel({
            name: name.trim(),
            contactNumber: contactNumber.trim(),
        });

        const savedSupplier = await supplier.save();
        logger.info('Supplier created successfully', { supplierId: savedSupplier._id, name });

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: { supplier: savedSupplier },
        });
    } catch (error) {
        logger.error('Error creating supplier', error);
        next(error);
    }
};

/**
 * Get all suppliers (paginated)
 * GET /api/supplier
 */
const getSuppliers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const suppliers = await supplierModel.find()
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await supplierModel.countDocuments();

        logger.info('Suppliers fetched successfully', { count: suppliers.length, total });

        res.status(200).json({
            success: true,
            message: 'Suppliers retrieved successfully',
            data: {
                suppliers,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching suppliers', error);
        next(error);
    }
};

/**
 * Get supplier by ID
 * GET /api/supplier/:id
 */
const getSupplierById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Supplier fetch: No ID provided');
            return next(new AppError('Supplier ID is required', 400));
        }

        const supplier = await supplierModel.findById(id);

        if (!supplier) {
            logger.warn('Supplier fetch: Supplier not found', { id });
            return next(new AppError('Supplier not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Supplier retrieved successfully',
            data: { supplier },
        });
    } catch (error) {
        logger.error('Error fetching supplier', error);
        next(error);
    }
};

/**
 * Update supplier
 * PUT /api/supplier/:id
 */
const updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            logger.warn('Supplier update: No ID provided');
            return next(new AppError('Supplier ID is required', 400));
        }

        // If contact number is being updated, validate and check for duplicates
        if (updateData.contactNumber) {
            if (!validatePhoneNumber(updateData.contactNumber)) {
                logger.warn('Supplier update: Invalid phone number', { contactNumber: updateData.contactNumber });
                return next(new AppError('Invalid contact number format', 400));
            }

            const existingSupplier = await supplierModel.findOne({
                contactNumber: updateData.contactNumber.trim(),
                _id: { $ne: id },
            });

            if (existingSupplier) {
                logger.warn('Supplier update: Contact number already exists', { contactNumber: updateData.contactNumber });
                return next(new AppError('Contact number already in use', 400));
            }
        }

        const supplier = await supplierModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!supplier) {
            logger.warn('Supplier update: Supplier not found', { id });
            return next(new AppError('Supplier not found', 404));
        }

        logger.info('Supplier updated successfully', { supplierId: id });

        res.status(200).json({
            success: true,
            message: 'Supplier updated successfully',
            data: { supplier },
        });
    } catch (error) {
        logger.error('Error updating supplier', error);
        next(error);
    }
};

/**
 * Delete supplier
 * DELETE /api/supplier/:id
 */
const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Supplier delete: No ID provided');
            return next(new AppError('Supplier ID is required', 400));
        }

        const supplier = await supplierModel.findByIdAndDelete(id);

        if (!supplier) {
            logger.warn('Supplier delete: Supplier not found', { id });
            return next(new AppError('Supplier not found', 404));
        }

        logger.info('Supplier deleted successfully', { supplierId: id });

        res.status(200).json({
            success: true,
            message: 'Supplier deleted successfully',
            data: { supplier },
        });
    } catch (error) {
        logger.error('Error deleting supplier', error);
        next(error);
    }
};

module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
};