/**
 * User Controller
 * Handles user registration, login, and authentication
 */

const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateEmail, validatePassword, validateRequiredFields } = require("../utils/validation");

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

/**
 * Create a new user
 * POST /api/user/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { name, email, password },
            ['name', 'email', 'password']
        );

        if (!validation.isValid) {
            logger.warn('User registration: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Validate email format
        if (!validateEmail(email)) {
            logger.warn('User registration: Invalid email format', { email });
            return next(new AppError('Invalid email format', 400));
        }

        // Validate password strength
        if (!validatePassword(password)) {
            logger.warn('User registration: Weak password');
            return next(new AppError('Password must be at least 8 characters with uppercase, lowercase, and numbers', 400));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn('User registration: Email already exists', { email });
            return next(new AppError('Email already registered', 400));
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'customer',
        });

        const savedUser = await user.save();

        logger.info('User created successfully', { userId: savedUser._id, email: savedUser.email });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role,
                },
            },
        });
    } catch (error) {
        logger.error('Error creating user', error);
        next(error);
    }
};

/**
 * Login user and generate JWT token
 * POST /api/user/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(
            { email, password },
            ['email', 'password']
        );

        if (!validation.isValid) {
            logger.warn('User login: Missing required fields', validation.missingFields);
            return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            logger.warn('User login: User not found', { email });
            return next(new AppError('Invalid email or password', 401));
        }

        // Check password
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);

        if (!isPasswordCorrect) {
            logger.warn('User login: Incorrect password', { email });
            return next(new AppError('Invalid email or password', 401));
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: JWT_EXPIRY }
        );

        logger.info('User logged in successfully', { userId: user._id, email: user.email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        logger.error('Error during user login', error);
        next(error);
    }
};

module.exports = { createUser, loginUser };