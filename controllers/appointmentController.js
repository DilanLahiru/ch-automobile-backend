const appointmentModel = require("../models/appointmentModel");
const customerModel = require("../models/customerModel");
const { generatePassword } = require("../utils/passwordGenerator");
const { sendWelcomeEmail, sendAppointmentConfirmationEmail } = require("../utils/emailService");
const bcryptjs = require("bcryptjs");

const createAppointment = async (req, res) => {
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

  if (
    !customerId ||
    !customerName ||
    !customerContactNumber ||
    !appointmentDate ||
    !appointmentTime ||
    !vehicleNumber ||
    !vehicleModel ||
    !serviceType ||
    !status
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const customer = await customerModel.findById(customerId);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const appointment = new appointmentModel({
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
  });

  try {
    const savedAppointment = await appointment.save();
    res
      .status(201)
      .json({
        message: "Appointment created successfully",
        appointment: savedAppointment,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating appointment" });
  }
};

const createAppointmentWithCustomer = async (req, res) => {
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

  if (
    !customerName ||
    !customerEmail ||
    !customerContactNumber ||
    !appointmentDate ||
    !appointmentTime ||
    !vehicleNumber ||
    !vehicleModel ||
    !serviceType
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if customer already exists by email
    let customer = await customerModel.findOne({ email: customerEmail });

    // If customer doesn't exist, create a new one
    if (!customer) {
      // Generate a default password
      const defaultPassword = generatePassword(12);

      // Hash the password before saving
      const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

      customer = new customerModel({
        name: customerName,
        email: customerEmail,
        contactNumber: customerContactNumber,
        password: hashedPassword,
      });
      await customer.save();

    // Send welcome email with the password
    const emailSent = await sendWelcomeEmail(customerEmail, customerName, defaultPassword);
    }

    // Create the appointment with the customer ID
    const appointment = new appointmentModel({
      customerId: customer._id,
      customerName,
      customerContactNumber,
      appointmentDate,
      appointmentTime,
      vehicleNumber,
      vehicleModel,
      serviceType,
      status: status || "pending",
      note,
      createdBy,
    });

    const savedAppointment = await appointment.save();
    res.status(201).json({
      message: "Appointment created successfully",
      appointment: savedAppointment,
      customer: customer,
      emailSent: emailSent,
    });
    console.log(savedAppointment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating appointment" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Update an appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appointment = await appointmentModel.findByIdAndUpdate(id, { status });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment && status === "confirmed") {
      // Send appointment confirmation email
      const customer = await customerModel.findById(appointment.customerId);
      const emailSent = await sendAppointmentConfirmationEmail(customer.email, appointment);

      if (!emailSent) {
        return res.status(500).json({ message: "Error sending appointment confirmation email" });
      }
    }

    res.status(200).json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    console.log("Error updating appointment:", error);
    res.status(500).json({ message: "Error updating appointment" });
  }
};

const getAppointmentsByCustomerId = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('====================================');
    console.log("USER ID : " + userId);
    console.log('====================================');

    if (!userId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Verify that the customer exists
    const customer = await customerModel.findById(userId);
    console.log('====================================');
    console.log("customer " + customer);
    console.log('====================================');
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customerId = userId;

    const appointments = await appointmentModel.find({ customerId });

    if (appointments.length === 0) {
      return res.status(200).json({ message: "No appointments found", appointments: [] });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

module.exports = {
  createAppointment,
  createAppointmentWithCustomer,
  getAppointments,
  getAppointmentsByCustomerId,
  updateAppointment,
};
