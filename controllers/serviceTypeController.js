/**
 * Service Type Controller
 * Handles service type CRUD operations
 */

const serviceTypeModel = require("../models/serviceTypeModel");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../utils/validation");

/**
 * Create a new service type
 * POST /api/service-type/create
 */
const createServiceType = async (req, res, next) => {
    try {
        const { name } = req.body;

        // Validate required fields
        const validation = validateRequiredFields({ name }, ['name']);

        if (!validation.isValid) {
            logger.warn('Service type creation: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Check for duplicate service type
        const existingServiceType = await serviceTypeModel.findOne({ name: name.toLowerCase().trim() });
        if (existingServiceType) {
            logger.warn('Service type creation: Service type already exists', { name });
            return next(new AppError('Service type already exists', 400));
        }

        // Create service type
        const serviceType = new serviceTypeModel({
            name: name.trim(),
        });

        const savedServiceType = await serviceType.save();
        logger.info('Service type created successfully', { serviceTypeId: savedServiceType._id, name });

        res.status(201).json({
            success: true,
            message: 'Service Type created successfully',
            data: { serviceType: savedServiceType },
        });
    } catch (error) {
        logger.error('Error creating service type', error);
        next(error);
    }
};

/**
 * Get all service types (paginated)
 * GET /api/service-type
 */
const getServiceTypes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const serviceTypes = await serviceTypeModel.find()
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await serviceTypeModel.countDocuments();

        logger.info('Service types fetched successfully', { count: serviceTypes.length, total });

        res.status(200).json({
            success: true,
            message: 'Service Types retrieved successfully',
            data: {
                serviceTypes,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching service types', error);
        next(error);
    }
};

/**
 * Get service type by ID
 * GET /api/service-type/:id
 */
const getServiceTypeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Service type fetch: No ID provided');
            return next(new AppError('Service Type ID is required', 400));
        }

        const serviceType = await serviceTypeModel.findById(id);

        if (!serviceType) {
            logger.warn('Service type fetch: Service type not found', { id });
            return next(new AppError('Service Type not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Service Type retrieved successfully',
            data: { serviceType },
        });
    } catch (error) {
        logger.error('Error fetching service type', error);
        next(error);
    }
};

/**
 * Update service type
 * PUT /api/service-type/:id
 */
const updateServiceType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!id) {
            logger.warn('Service type update: No ID provided');
            return next(new AppError('Service Type ID is required', 400));
        }

        if (!name) {
            logger.warn('Service type update: Missing name field');
            return next(new AppError('Service Type name is required', 400));
        }

        const serviceType = await serviceTypeModel.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );

        if (!serviceType) {
            logger.warn('Service type update: Service type not found', { id });
            return next(new AppError('Service Type not found', 404));
        }

        logger.info('Service type updated successfully', { serviceTypeId: id });

        res.status(200).json({
            success: true,
            message: 'Service Type updated successfully',
            data: { serviceType },
        });
    } catch (error) {
        logger.error('Error updating service type', error);
        next(error);
    }
};

/**
 * Delete service type
 * DELETE /api/service-type/:id
 */
const deleteServiceType = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Service type delete: No ID provided');
            return next(new AppError('Service Type ID is required', 400));
        }

        const serviceType = await serviceTypeModel.findByIdAndDelete(id);

        if (!serviceType) {
            logger.warn('Service type delete: Service type not found', { id });
            return next(new AppError('Service Type not found', 404));
        }

        logger.info('Service type deleted successfully', { serviceTypeId: id });

        res.status(200).json({
            success: true,
            message: 'Service Type deleted successfully',
            data: { serviceType },
        });
    } catch (error) {
        logger.error('Error deleting service type', error);
        next(error);
    }
};

module.exports = {
    createServiceType,
    getServiceTypes,
    getServiceTypeById,
    updateServiceType,
    deleteServiceType,
};