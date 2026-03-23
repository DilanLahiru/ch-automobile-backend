/**
 * Authentication Middleware
 * Validates JWT token from Authorization header
 * Attaches user information to request object
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      logger.warn('Auth middleware: No token provided');
      return next(new AppError('No token provided', 401));
    }

    // Extract token from "Bearer <token>"
    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      logger.warn('Auth middleware: Invalid token format');
      return next(new AppError('Invalid token format. Use Bearer <token>', 401));
    }

    const token = tokenParts[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    logger.debug('Auth middleware: Token verified', { userId: decoded.userId });

    logger.debug('Auth middleware: Token verified', { userId: decoded.userId });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Auth middleware: Invalid token');
      return next(new AppError('Invalid token', 401));
    }

    if (error.name === 'TokenExpiredError') {
      logger.warn('Auth middleware: Token expired');
      return next(new AppError('Token expired', 401));
    }

    logger.error('Auth middleware: Token verification failed', error);
    return next(new AppError('Authentication failed', 401));
  }
};

module.exports = { authMiddleware };