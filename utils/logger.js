/**
 * Logger utility for consistent logging across the application
 * Supports different log levels: info, warn, error, debug
 */

const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },

  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },

  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error('Error Details:', error.message, error.stack);
    }
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? data : '');
    }
  },
};

module.exports = logger;
