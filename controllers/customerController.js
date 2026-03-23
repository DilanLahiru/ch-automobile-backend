/**
 * Customer Controller
 * Handles customer registration, login, and retrieval
 */

const Customer = require('../models/customerModel');
const { generatePassword } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../utils/emailService');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');
const { validateEmail, validateRequiredFields } = require('../utils/validation');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

/**
 * Register a new customer with auto-generated password
 * POST /api/customer/register
 */
const registerCustomer = async (req, res, next) => {
    try {
        const { name, email, contactNumber } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { name, email, contactNumber },
            ['name', 'email', 'contactNumber']
        );

        if (!validation.isValid) {
            logger.warn('Customer registration: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Validate email format
        if (!validateEmail(email)) {
            logger.warn('Customer registration: Invalid email format', { email });
            return next(new AppError('Invalid email format', 400));
        }

        // Check existing customer
        const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
        if (existingCustomer) {
            logger.warn('Customer registration: Email already exists', { email });
            return next(new AppError('Email already registered', 400));
        }

        // Generate and hash password
        const defaultPassword = generatePassword(12);
        const hashedPassword = await bcryptjs.hash(defaultPassword, SALT_ROUNDS);

        // Create customer
        const customer = new Customer({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            contactNumber: contactNumber.trim(),
            password: hashedPassword,
        });

        const savedCustomer = await customer.save();

        // Send welcome email
        const emailSent = await sendWelcomeEmail(email, name, defaultPassword);
        logger.info('Customer registered successfully', { customerId: savedCustomer._id, email });

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            data: {
                customer: {
                    id: savedCustomer._id,
                    name: savedCustomer.name,
                    email: savedCustomer.email,
                    contactNumber: savedCustomer.contactNumber,
                },
                emailSent,
            },
        });
    } catch (error) {
        logger.error('Error registering customer', error);
        next(error);
    }
};

/**
 * Login customer and generate JWT token
 * POST /api/customer/login
 */
const loginCustomer = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { email, password },
            ['email', 'password']
        );

        if (!validation.isValid) {
            logger.warn('Customer login: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Find customer
        const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

        if (!customer) {
            logger.warn('Customer login: Customer not found', { email });
            return next(new AppError('Invalid email or password', 401));
        }

        // Check password
        const isPasswordCorrect = await bcryptjs.compare(password, customer.password);

        if (!isPasswordCorrect) {
            logger.warn('Customer login: Incorrect password', { email });
            return next(new AppError('Invalid email or password', 401));
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: customer._id, email: customer.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: JWT_EXPIRY }
        );

        logger.info('Customer logged in successfully', { customerId: customer._id, email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: customer._id,
                    name: customer.name,
                    email: customer.email,
                    contactNumber: customer.contactNumber,
                },
            },
        });
    } catch (error) {
        logger.error('Error during customer login', error);
        next(error);
    }
};

/**
 * Get all customers (paginated)
 * GET /api/customer
 */
const loadAllCustomers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const customers = await Customer.find()
            .select('-password')
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments();

        logger.info('Customers fetched successfully', { count: customers.length, total });

        res.status(200).json({
            success: true,
            message: 'Customers retrieved successfully',
            data: {
                customers,
                pagination: {
                    current: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        logger.error('Error fetching customers', error);
        next(error);
    }
};

module.exports = { registerCustomer, loadAllCustomers, loginCustomer };