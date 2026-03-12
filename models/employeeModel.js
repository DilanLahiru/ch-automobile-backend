const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  nicNumber: {
    type: String,
    required: true,
  },
  epfNumber: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('employee', employeeSchema);