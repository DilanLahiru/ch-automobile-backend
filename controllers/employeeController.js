/**
 * Employee Controller
 * Handles employee CRUD operations
 */

const Employee = require('../models/employeeModel');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');
const { validateEmail, validateRequiredFields } = require('../utils/validation');

/**
 * Create a new employee
 * POST /api/employee/create
 */
const createEmployee = async (req, res, next) => {
    try {
        const { name, email, contactNumber, address, nicNumber, epfNumber } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { name, email, contactNumber, address, nicNumber, epfNumber },
            ['name', 'email', 'contactNumber', 'address', 'nicNumber', 'epfNumber']
        );

        if (!validation.isValid) {
            logger.warn('Employee creation: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Validate email format
        if (!validateEmail(email)) {
            logger.warn('Employee creation: Invalid email format', { email });
            return next(new AppError('Invalid email format', 400));
        }

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email: email.toLowerCase().trim() });
        if (existingEmployee) {
            logger.warn('Employee creation: Email already exists', { email });
            return next(new AppError('Email already registered', 400));
        }

        // Create employee
        const employee = new Employee({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            contactNumber: contactNumber.trim(),
            address: address.trim(),
            nicNumber: nicNumber.trim(),
            epfNumber: epfNumber.trim(),
            createdAt: new Date(),
        });

        const savedEmployee = await employee.save();
        logger.info('Employee created successfully', { employeeId: savedEmployee._id, email });

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: { employee: savedEmployee },
        });
    } catch (error) {
        logger.error('Error creating employee', error);
        next(error);
    }
};

/**
 * Get all employees (paginated)
 * GET /api/employee
 */
const getEmployees = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const employees = await Employee.find()
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await Employee.countDocuments();

        logger.info('Employees fetched successfully', { count: employees.length, total });

        res.status(200).json({
            success: true,
            message: 'Employees retrieved successfully',
            data: {
                employees,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching employees', error);
        next(error);
    }
};

/**
 * Get employee by ID
 * GET /api/employee/:id
 */
const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Employee fetch: No ID provided');
            return next(new AppError('Employee ID is required', 400));
        }

        const employee = await Employee.findById(id);

        if (!employee) {
            logger.warn('Employee fetch: Employee not found', { id });
            return next(new AppError('Employee not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Employee retrieved successfully',
            data: { employee },
        });
    } catch (error) {
        logger.error('Error fetching employee', error);
        next(error);
    }
};

/**
 * Update employee
 * PUT /api/employee/:id
 */
const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            logger.warn('Employee update: No ID provided');
            return next(new AppError('Employee ID is required', 400));
        }

        // If email is being updated, check for duplicates
        if (updateData.email) {
            const existingEmployee = await Employee.findOne({
                email: updateData.email.toLowerCase().trim(),
                _id: { $ne: id },
            });

            if (existingEmployee) {
                logger.warn('Employee update: Email already exists', { email: updateData.email });
                return next(new AppError('Email already in use', 400));
            }
        }

        const employee = await Employee.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!employee) {
            logger.warn('Employee update: Employee not found', { id });
            return next(new AppError('Employee not found', 404));
        }

        logger.info('Employee updated successfully', { employeeId: id });

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: { employee },
        });
    } catch (error) {
        logger.error('Error updating employee', error);
        next(error);
    }
};

/**
 * Delete employee
 * DELETE /api/employee/:id
 */
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            logger.warn('Employee delete: No ID provided');
            return next(new AppError('Employee ID is required', 400));
        }

        const employee = await Employee.findByIdAndDelete(id);

        if (!employee) {
            logger.warn('Employee delete: Employee not found', { id });
            return next(new AppError('Employee not found', 404));
        }

        logger.info('Employee deleted successfully', { employeeId: id });

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
            data: { employee },
        });
    } catch (error) {
        logger.error('Error deleting employee', error);
        next(error);
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
};