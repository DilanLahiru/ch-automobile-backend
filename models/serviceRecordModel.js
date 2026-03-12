const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'appointment',
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'employee',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
    required: true,
  },
  description: {
    type: String,
  },
  parts: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  laborCost: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
  },
  status: {
    type: String,
    default: 'pending',
  },
  vehicleNumber: {
    type: String,
  },
  serviceDescription: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('serviceRecord', serviceRecordSchema);