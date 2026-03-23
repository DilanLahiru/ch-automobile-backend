/**
 * Service Record Controller
 * Handles service record creation, retrieval, and analytics
 */

const mongoose = require('mongoose');
const serviceRecordModel = require("../models/serviceRecordModel");
const appointmentModel = require("../models/appointmentModel");
const customerModel = require("../models/customerModel");
const productModel = require("../models/productModel");
const employeeModel = require("../models/employeeModel");
const { sendServiceCompletionEmail } = require("../utils/emailService");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateRequiredFields } = require("../utils/validation");

/**
 * Create a new service record with parts inventory management
 * POST /api/service-record/create
 */
const createServiceRecord = async (req, res, next) => {
  try {
    const {
      appointmentId,
      employeeId,
      customerId,
      parts,
      laborCost,
      totalAmount,
      status,
      vehicleNumber,
      serviceDescription,
    } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(
      { employeeId, customerId, appointmentId, parts },
      ['employeeId', 'customerId', 'appointmentId', 'parts']
    );

    if (!validation.isValid) {
      logger.warn('Service record creation: Missing required fields', validation.missingFields);
      return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
    }

    // Validate parts array
    if (!Array.isArray(parts) || parts.length === 0) {
      logger.warn('Service record creation: Invalid parts array');
      return next(new AppError('Parts array must be provided and not empty', 400));
    }

    // Verify references
    const [customer, employee] = await Promise.all([
      customerModel.findById(customerId),
      employeeModel.findById(employeeId),
    ]);

    if (!customer || !employee) {
      logger.warn('Service record creation: Customer or Employee not found', { customerId, employeeId });
      return next(new AppError('Customer or Employee not found', 404));
    }

    // Verify all parts exist and have sufficient stock
    for (const part of parts) {
      const product = await productModel.findById(part._id);
      
      if (!product) {
        logger.warn('Service record creation: Product not found', { productId: part._id });
        return next(new AppError(`Product with ID ${part._id} not found`, 404));
      }

      if (product.quantity < part.quantity) {
        logger.warn('Service record creation: Insufficient stock', { productId: part._id, available: product.quantity, requested: part.quantity });
        return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${part.quantity}`, 400));
      }
    }

    // Create service record
    const serviceRecord = new serviceRecordModel({
      appointmentId,
      employeeId,
      customerId,
      parts,
      laborCost: parseFloat(laborCost) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      status: status || 'pending',
      vehicleNumber: vehicleNumber ? vehicleNumber.trim() : '',
      serviceDescription: serviceDescription ? serviceDescription.trim() : '',
    });

    try {
      // Update appointment status
      await appointmentModel.findByIdAndUpdate(appointmentId, { status: 'completed' });

      // Reduce product inventory
      for (const part of parts) {
        await productModel.findByIdAndUpdate(
          part._id,
          { $inc: { quantity: -part.quantity } },
          { new: true }
        );
      }

      // Save service record
      const savedServiceRecord = await serviceRecord.save();

      // Send completion email
      try {
        if (customer.email) {
          await sendServiceCompletionEmail(customer.email, customer.name, savedServiceRecord);
        }
      } catch (emailError) {
        logger.warn('Error sending service completion email', emailError);
      }

      logger.info('Service record created successfully', { serviceRecordId: savedServiceRecord._id, customerId });

      res.status(201).json({
        success: true,
        message: 'Service record created successfully',
        data: { serviceRecord: savedServiceRecord },
      });
    } catch (dbError) {
      logger.error('Error saving service record or updating inventory', dbError);
      throw dbError;
    }
  } catch (error) {
    logger.error('Error creating service record', error);
    next(error);
  }
};

/**
 * Get all service records (paginated with population)
 * GET /api/service-record
 */
const getServiceRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const serviceRecords = await serviceRecordModel
      .find()
      .populate('employeeId', 'name email')
      .populate('customerId', 'name email contactNumber')
      .populate('appointmentId', 'appointmentDate vehicleNumber')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await serviceRecordModel.countDocuments();

    logger.info('Service records fetched successfully', { count: serviceRecords.length, total });

    res.status(200).json({
      success: true,
      message: 'Service records retrieved successfully',
      data: {
        serviceRecords,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching service records', error);
    next(error);
  }
};

/**
 * Get service history by customer ID
 * GET /api/service-record/customer/:customerId
 */
const getServiceRecordsByCustomerId = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { sortBy = 'recent', page = 1, limit = 10 } = req.query;

    if (!customerId) {
      logger.warn('Service record fetch: No customer ID provided');
      return next(new AppError('Customer ID is required', 400));
    }

    // Verify customer exists
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      logger.warn('Service record fetch: Customer not found', { customerId });
      return next(new AppError('Customer not found', 404));
    }

    // Build sort object
    const sortObj = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount: { totalAmount: -1 },
    }[sortBy] || { createdAt: -1 };

    const skip = (page - 1) * limit;

    // Fetch service records with pagination
    const serviceRecords = await serviceRecordModel
      .find({ customerId })
      .populate('employeeId', 'name email')
      .populate('customerId', 'name email contactNumber')
      .populate('appointmentId', 'appointmentDate vehicleNumber')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get totals
    const totalRecords = await serviceRecordModel.countDocuments({ customerId });
    const completedRecords = await serviceRecordModel.countDocuments({ customerId, status: 'completed' });

    logger.info('Customer service records fetched successfully', { customerId, count: serviceRecords.length });

    res.status(200).json({
      success: true,
      message: totalRecords === 0 ? 'No service records found' : 'Service records retrieved successfully',
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          contactNumber: customer.contactNumber,
        },
        serviceRecords,
        statistics: {
          totalRecords,
          completedRecords,
          pendingRecords: totalRecords - completedRecords,
        },
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          pages: Math.ceil(totalRecords / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching customer service records', error);
    next(error);
  }
};

/**
 * Get service records by employee ID
 * GET /api/service-record/employee/:employeeId
 */
const getServiceRecordsByEmployeeId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { sortBy = 'recent', page = 1, limit = 10 } = req.query;

    if (!employeeId) {
      logger.warn('Service record fetch: No employee ID provided');
      return next(new AppError('Employee ID is required', 400));
    }

    // Verify employee exists
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      logger.warn('Service record fetch: Employee not found', { employeeId });
      return next(new AppError('Employee not found', 404));
    }

    // Build sort object
    const sortObj = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 },
      amount: { totalAmount: -1 },
    }[sortBy] || { createdAt: -1 };

    const skip = (page - 1) * limit;

    // Fetch service records with pagination
    const serviceRecords = await serviceRecordModel
      .find({ employeeId })
      .populate('employeeId', 'name email')
      .populate('customerId', 'name email contactNumber')
      .populate('appointmentId', 'appointmentDate vehicleNumber')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get totals
    const totalRecords = await serviceRecordModel.countDocuments({ employeeId });
    const completedRecords = await serviceRecordModel.countDocuments({ employeeId, status: 'completed' });

    logger.info('Employee service records fetched successfully', { employeeId, count: serviceRecords.length });

    res.status(200).json({
      success: true,
      message: totalRecords === 0 ? 'No service records found' : 'Service records retrieved successfully',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
        },
        serviceRecords,
        statistics: {
          totalRecords,
          completedRecords,
          pendingRecords: totalRecords - completedRecords,
        },
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          pages: Math.ceil(totalRecords / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching employee service records', error);
    next(error);
  }
};

module.exports = {
  createServiceRecord,
  getServiceRecords,
  getServiceRecordsByCustomerId,
  getServiceRecordsByEmployeeId,
};
