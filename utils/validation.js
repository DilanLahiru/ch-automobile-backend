/**
 * Input validation utilities
 * Provides reusable validation functions for common data types
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

const validateObject = (obj, schema) => {
  const errors = {};

  Object.keys(schema).forEach(field => {
    const validation = schema[field];
    const value = obj[field];

    if (validation.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
    }

    if (value && validation.type) {
      if (typeof value !== validation.type) {
        errors[field] = `${field} must be of type ${validation.type}`;
      }
    }

    if (value && validation.minLength && value.toString().length < validation.minLength) {
      errors[field] = `${field} must be at least ${validation.minLength} characters`;
    }

    if (value && validation.custom) {
      if (!validation.custom(value)) {
        errors[field] = validation.customMessage || `${field} is invalid`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRequiredFields,
  validateObject,
};
