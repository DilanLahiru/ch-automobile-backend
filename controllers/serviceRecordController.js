const mongoose = require('mongoose');
const serviceRecordModel = require("../models/serviceRecordModel");
const appointmentModel = require("../models/appointmentModel");
const customerModel = require("../models/customerModel");
const productModel = require("../models/productModel");
const employeeModel = require("../models/employeeModel");
const { sendServiceCompletionEmail } = require("../utils/emailService");

const createServiceRecord = async (req, res) => {
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

  if (
    !employeeId ||
    !customerId ||
    !appointmentId ||
    !parts ||
    !Array.isArray(parts) ||
    parts.length === 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Missing required fields: employeeId, customerId, and parts array",
      });
  }

  const customer = await customerModel.findById(customerId);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const employee = await employeeModel.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Verify all products exist and check stock availability
  for (const part of parts) {
    const product = await productModel.findById(part._id);
    if (!product) {
      return res
        .status(404)
        .json({ message: `Product with ID ${part._id} not found` });
    }
    console.log("Product :", product.name, "Quantity:", product.quantity);

    if (product.quantity < part.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${part.quantity}`,
      });
    }
  }

  const serviceRecord = new serviceRecordModel({
    appointmentId,
    employeeId,
    customerId,
    parts,
    laborCost: laborCost || 0,
    totalAmount: totalAmount || 0,
    status: status || "pending",
    vehicleNumber,
    serviceDescription,
  });

  try {
    // Update related appointment status to completed after service completion
    await appointmentModel.findByIdAndUpdate(appointmentId, { status: "completed" });
    
    // Reduce product quantities in the database
    for (const part of parts) {
      await productModel.findByIdAndUpdate(
        part._id,
        { $inc: { quantity: -part.quantity } },
        { new: true },
      );
    }

    const savedServiceRecord = await serviceRecord.save();
    
    // Send service completion email to customer
    if (customer.email) {
      await sendServiceCompletionEmail(customer.email, customer.name, savedServiceRecord);
    }
    
    res.status(201).json({
      message: "Service record created successfully and appointment updated",
      serviceRecord: savedServiceRecord,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating service record" });
  }
};

const getServiceRecords = async (req, res) => {
  try {
    const serviceRecords = await serviceRecordModel
      .find()
      .populate("employeeId", "name email")
      .populate("customerId", "name email contactNumber");

    res.status(200).json(serviceRecords);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching service records" });
  }
};

// Get service history by customer ID with detailed analytics
const getServiceRecordsByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const { sortBy = 'recent', limit = 50 } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Verify customer exists
    const customer = await customerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: most recent first
    if (sortBy === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sortBy === 'amount') {
      sortObj = { totalAmount: -1 };
    }

    // Fetch service records
    const serviceRecords = await serviceRecordModel
      .find({ customerId })
      .populate("employeeId", "name email department")
      .populate("customerId", "name email contactNumber")
      .populate("appointmentId", "appointmentDate vehicleNumber")
      .sort(sortObj)
      .limit(parseInt(limit));

    // Calculate statistics
    const totalRecords = await serviceRecordModel.countDocuments({ customerId });
    const completedRecords = await serviceRecordModel.countDocuments({ 
      customerId, 
      status: 'completed' 
    });
    
    // const stats = await serviceRecordModel.aggregate([
    //   { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalSpent: { $sum: "$totalAmount" },
    //       totalLabor: { $sum: "$laborCost" },
    //       // averageSpent: { $avg: "$totalAmount" },
    //       // maxSpent: { $max: "$totalAmount" },
    //       // minSpent: { $min: "$totalAmount" },
    //     }
    //   }
    // ]);

    // Format service records for display
    const formattedRecords = serviceRecords.map(record => ({
      _id: record._id,
      date: record.createdAt,
      vehicleNumber: record.vehicleNumber,
      description: record.serviceDescription,
      //status: record.status,
      employee: record.employeeId,
      partsCount: record.parts ? record.parts.length : 0,
      laborCost: record.laborCost,
      totalAmount: record.totalAmount,
      parts: record.parts,
    }));

    res.status(200).json({
      success: true,
      // customer: {
      //   name: customer.name,
      //   email: customer.email,
      //   contactNumber: customer.contactNumber,
      // },
      // statistics: {
      //   totalServiceRecords: totalRecords,
      //   completedRecords: completedRecords,
      //   pendingRecords: totalRecords - completedRecords,
      //   summary: stats.length > 0 ? stats[0] : {
      //     totalSpent: 0,
      //     totalLabor: 0,
      //     averageSpent: 0,
      //     maxSpent: 0,
      //     minSpent: 0,
      //   }
      // },
      serviceHistory: formattedRecords,
      message: `Found ${totalRecords} service records for this customer`,
    });
  } catch (error) {
    console.error("Error fetching service records:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching service records",
      error: error.message 
    });
  }
};

// Get service record by employee ID
const getServiceRecordsByEmployeeId = async (req, res) => {
  console.log('====================================');
  console.log('Calling ... ', req.params.employeeId);
  console.log('====================================');
  try {
    const employeeId = req.params.employeeId;
    const { sortBy = 'recent', limit = 50 } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Verify employee exists
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: most recent first
    if (sortBy === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sortBy === 'amount') {
      sortObj = { totalAmount: -1 };
    }

    // Fetch service records
    const serviceRecords = await serviceRecordModel
      .find({ employeeId })
      .populate("employeeId", "name email department")
      .populate("customerId", "name email contactNumber")
      .populate("appointmentId", "appointmentDate vehicleNumber")
      .sort(sortObj)
      .limit(parseInt(limit));

    // Calculate statistics
    const totalRecords = await serviceRecordModel.countDocuments({ employeeId });
    const completedRecords = await serviceRecordModel.countDocuments({ 
      employeeId, 
      status: 'completed' 
    });

    // Format service records for display
    const formattedRecords = serviceRecords.map(record => ({
      _id: record._id,
      date: record.createdAt,
      vehicleNumber: record.vehicleNumber,
      description: record.serviceDescription,
      customer: record.customerId,
      partsCount: record.parts ? record.parts.length : 0,
      laborCost: record.laborCost,
      totalAmount: record.totalAmount,
      status: record.status,
      parts: record.parts,
    }));

    res.status(200).json({
      success: true,
      employee: {
        name: employee.name,
        email: employee.email,
        department: employee.department,
      },
      statistics: {
        totalServiceRecords: totalRecords,
        completedRecords: completedRecords,
        pendingRecords: totalRecords - completedRecords,
      },
      serviceHistory: formattedRecords,
      message: `Found ${totalRecords} service records for this employee`,
    });
  } catch (error) {
    console.log("Error fetching service records:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching service records",
      error: error.message 
    });
  }
};

module.exports = {
  createServiceRecord,
  getServiceRecords,
  getServiceRecordsByCustomerId,
  getServiceRecordsByEmployeeId,
};
