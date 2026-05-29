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
  otherCharges: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'otherCharge',
        required: true,
      },
      chargeType: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
      },
    }
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
  paymentType: {
    type: String,
    default: 'cash',
    required: true,
  },
  serviceType: {
    type: String,
    default: 'General Service',
    required: true,
  },
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'serviceType',
    required: true,
  },
});

module.exports = mongoose.model('serviceRecord', serviceRecordSchema);