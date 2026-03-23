/**
 * Appointment Controller
 * Handles appointment CRUD operations and customer interactions
 */

const appointmentModel = require("../models/appointmentModel");
const customerModel = require("../models/customerModel");
const { generatePassword } = require("../utils/passwordGenerator");
const { sendWelcomeEmail, sendAppointmentConfirmationEmail } = require("../utils/emailService");
const bcryptjs = require("bcryptjs");
const logger = require("../utils/logger");
const { AppError } = require("../utils/errorHandler");
const { validateEmail, validateRequiredFields } = require("../utils/validation");

const SALT_ROUNDS = 10;

/**
 * Create appointment for existing customer
 * POST /api/appointment/create
 */
const createAppointment = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerContactNumber,
      appointmentDate,
      appointmentTime,
      vehicleNumber,
      vehicleModel,
      serviceType,
      status,
      note,
      createdBy,
    } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(
      {
        customerId,
        customerName,
        customerContactNumber,
        appointmentDate,
        appointmentTime,
        vehicleNumber,
        vehicleModel,
        serviceType,
        status,
      },
      [
        'customerId',
        'customerName',
        'customerContactNumber',
        'appointmentDate',
        'appointmentTime',
        'vehicleNumber',
        'vehicleModel',
        'serviceType',
        'status',
      ]
    );

    if (!validation.isValid) {
      logger.warn('Appointment creation: Missing required fields', validation.missingFields);
      return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
    }

    // Validate customer exists
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      logger.warn('Appointment creation: Customer not found', { customerId });
      return next(new AppError('Customer not found', 404));
    }

    // Create appointment
    const appointment = new appointmentModel({
      customerId,
      customerName: customerName.trim(),
      customerContactNumber: customerContactNumber.trim(),
      appointmentDate,
      appointmentTime,
      vehicleNumber: vehicleNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      serviceType: serviceType.trim(),
      status: status.trim(),
      note: note ? note.trim() : '',
      createdBy: createdBy ? createdBy.trim() : '',
    });

    const savedAppointment = await appointment.save();
    logger.info('Appointment created successfully', { appointmentId: savedAppointment._id, customerId });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment: savedAppointment },
    });
  } catch (error) {
    logger.error('Error creating appointment', error);
    next(error);
  }
};

/**
 * Create appointment with auto-created customer
 * POST /api/appointment/create-with-customer
 */
const createAppointmentWithCustomer = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerContactNumber,
      appointmentDate,
      appointmentTime,
      vehicleNumber,
      vehicleModel,
      serviceType,
      status,
      note,
      createdBy,
    } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(
      {
        customerName,
        customerEmail,
        customerContactNumber,
        appointmentDate,
        appointmentTime,
        vehicleNumber,
        vehicleModel,
        serviceType,
      },
      ['customerName', 'customerEmail', 'customerContactNumber', 'appointmentDate', 'appointmentTime', 'vehicleNumber', 'vehicleModel', 'serviceType']
    );

    if (!validation.isValid) {
      logger.warn('Appointment creation: Missing required fields', validation.missingFields);
      return next(new AppError(`Missing required fields: ${validation.missingFields.join(', ')}`, 400));
    }

    // Validate email
    if (!validateEmail(customerEmail)) {
      logger.warn('Appointment creation: Invalid email format', { email: customerEmail });
      return next(new AppError('Invalid email format', 400));
    }

    // Check if customer exists
    let customer = await customerModel.findOne({ email: customerEmail.toLowerCase().trim() });
    let emailSent = false;

    // Create customer if doesn't exist
    if (!customer) {
      const defaultPassword = generatePassword(12);
      const hashedPassword = await bcryptjs.hash(defaultPassword, SALT_ROUNDS);

      customer = new customerModel({
        name: customerName.trim(),
        email: customerEmail.toLowerCase().trim(),
        contactNumber: customerContactNumber.trim(),
        password: hashedPassword,
      });

      await customer.save();
      emailSent = await sendWelcomeEmail(customerEmail, customerName, defaultPassword);
      logger.info('New customer created for appointment', { customerId: customer._id, email: customerEmail });
    }

    // Create appointment
    const appointment = new appointmentModel({
      customerId: customer._id,
      customerName: customerName.trim(),
      customerContactNumber: customerContactNumber.trim(),
      appointmentDate,
      appointmentTime,
      vehicleNumber: vehicleNumber.trim(),
      vehicleModel: vehicleModel.trim(),
      serviceType: serviceType.trim(),
      status: status || 'pending',
      note: note ? note.trim() : '',
      createdBy: createdBy ? createdBy.trim() : '',
    });

    const savedAppointment = await appointment.save();
    logger.info('Appointment created successfully', { appointmentId: savedAppointment._id, customerId: customer._id });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: savedAppointment,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
        },
        emailSent,
      },
    });
  } catch (error) {
    logger.error('Error creating appointment with customer', error);
    next(error);
  }
};

/**
 * Get all appointments (paginated)
 * GET /api/appointment
 */
const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    const appointments = await appointmentModel.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await appointmentModel.countDocuments(filter);

    logger.info('Appointments fetched successfully', { count: appointments.length, total });

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching appointments', error);
    next(error);
  }
};

/**
 * Update appointment status
 * PUT /api/appointment/:id
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      logger.warn('Appointment update: No ID provided');
      return next(new AppError('Appointment ID is required', 400));
    }

    if (!status) {
      logger.warn('Appointment update: No status provided');
      return next(new AppError('Status is required', 400));
    }

    const appointment = await appointmentModel.findByIdAndUpdate(id, { status }, { new: true });

    if (!appointment) {
      logger.warn('Appointment update: Appointment not found', { id });
      return next(new AppError('Appointment not found', 404));
    }

    // Send confirmation email if status is confirmed
    if (status === 'confirmed') {
      try {
        const customer = await customerModel.findById(appointment.customerId);
        if (customer && customer.email) {
          await sendAppointmentConfirmationEmail(customer.email, appointment);
          logger.info('Confirmation email sent', { appointmentId: id, email: customer.email });
        }
      } catch (emailError) {
        logger.warn('Error sending confirmation email', emailError);
        // Don't fail the request if email fails
      }
    }

    logger.info('Appointment updated successfully', { appointmentId: id, status });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment },
    });
  } catch (error) {
    logger.error('Error updating appointment', error);
    next(error);
  }
};

/**
 * Get appointments by customer ID (for authenticated customer)
 * GET /api/appointment/customer/:customerId
 */
const getAppointmentsByCustomerId = async (req, res, next) => {
  try {
    const customerId = req.userId || req.params.customerId;

    if (!customerId) {
      logger.warn('Appointment fetch: No customer ID provided');
      return next(new AppError('Customer ID is required', 400));
    }

    // Verify customer exists
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      logger.warn('Appointment fetch: Customer not found', { customerId });
      return next(new AppError('Customer not found', 404));
    }

    // Fetch customer appointments
    const appointments = await appointmentModel.find({ customerId })
      .sort({ createdAt: -1 });

    logger.info('Customer appointments fetched successfully', { customerId, count: appointments.length });

    res.status(200).json({
      success: true,
      message: appointments.length === 0 ? 'No appointments found' : 'Appointments retrieved successfully',
      data: {
        appointments,
        count: appointments.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching customer appointments', error);
    next(error);
  }
};

module.exports = {
  createAppointment,
  createAppointmentWithCustomer,
  getAppointments,
  getAppointmentsByCustomerId,
  updateAppointment,
};
