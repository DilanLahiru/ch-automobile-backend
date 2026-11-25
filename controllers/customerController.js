const Customer = require("../models/customerModel");
const { generatePassword } = require("../utils/passwordGenerator");
const { sendWelcomeEmail, sendOtpEmail } = require("../utils/emailService");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const OTP_VALIDITY_MINUTES = 5;

const registerCustomer = async (req, res) => {
  const { name, email, contactNumber } = req.body;
  console.log("====================================");
  console.log(req.body);
  console.log("====================================");

  if (!name || !contactNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existingCustomer = await Customer.findOne({ contactNumber });

  if (existingCustomer) {
    return res.status(400).json({ message: "contact number already exists" });
  }

  try {
    // Generate a default password
    const defaultPassword = generatePassword(12);

    // Hash the password before saving
    const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

    const customer = new Customer({
      name,
      email,
      contactNumber,
      password: hashedPassword,
    });

    const savedCustomer = await customer.save();

    // Send welcome email with the password
    if (!email) {
      const emailSent = await sendWelcomeEmail(email, name, defaultPassword);
    }

    res.status(201).json({
      message: "Customer registered successfully",
      customer: {
        _id: savedCustomer._id,
        name: savedCustomer.name,
        email: savedCustomer.email,
        contactNumber: savedCustomer.contactNumber,
      },
      emailSent: emailSent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating customer" });
  }
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const isPasswordCorrect = await bcryptjs.compare(
      password,
      customer.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ _id: customer._id }, process.env.JWT_SECRET_KEY);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        contactNumber: customer.contactNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const loadAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers" });
  }
};

// Implement removeCustomer function
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing customer" });
  }
};

// Implement updatePassword function
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log(id);
  console.log(req.body);

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required" });
  }

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const isPasswordCorrect = await bcryptjs.compare(
      currentPassword,
      customer.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    customer.password = hashedNewPassword;
    await customer.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating password" });
  }
};

// Implement updateCustomer function
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, contactNumber } = req.body;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(id, {
      name,
      email,
      contactNumber,
    });

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer" });
  }
};

// Generate and send an OTP to the customer's email to begin password reset
const requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcryptjs.hash(otp, 10);

    customer.resetPasswordOtp = hashedOtp;
    customer.resetPasswordOtpExpires = new Date(
      Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000,
    );
    await customer.save();

    const emailSent = await sendOtpEmail(customer.email, customer.name, otp);

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.status(200).json({ message: "OTP sent to your email address" });
  } catch (error) {
    res.status(500).json({ message: "Error generating OTP" });
  }
};

// Verify that the submitted OTP matches and has not expired
const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (
      !customer ||
      !customer.resetPasswordOtp ||
      !customer.resetPasswordOtpExpires
    ) {
      return res
        .status(400)
        .json({ message: "No OTP request found for this email" });
    }

    if (customer.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isOtpCorrect = await bcryptjs.compare(otp, customer.resetPasswordOtp);

    if (!isOtpCorrect) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Verify OTP again and update the customer's password
const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP and new password are required" });
  }

  try {
    const customer = await Customer.findOne({ email });

    if (
      !customer ||
      !customer.resetPasswordOtp ||
      !customer.resetPasswordOtpExpires
    ) {
      return res
        .status(400)
        .json({ message: "No OTP request found for this email" });
    }

    if (customer.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const isOtpCorrect = await bcryptjs.compare(otp, customer.resetPasswordOtp);

    if (!isOtpCorrect) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    customer.password = await bcryptjs.hash(newPassword, 10);
    customer.resetPasswordOtp = undefined;
    customer.resetPasswordOtpExpires = undefined;
    await customer.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  registerCustomer,
  loadAllCustomers,
  loginCustomer,
  deleteCustomer,
  updateCustomer,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
  updatePassword,
};
