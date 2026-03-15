const e = require("express");
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
  },
  customerName: {
    type: String,
    required: true,
  },
  customerContactNumber: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  vehicleModel: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: ["pending", "confirmed", "completed", "rejected", "cancelled"],
  },
  note: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    enum: ["customer", "admin"],
    default: "admin",
  },
});

module.exports = mongoose.model("appointment", appointmentSchema);
