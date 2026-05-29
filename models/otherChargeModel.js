const mongoose = require('mongoose');

const otherChargeSchema = new mongoose.Schema({
  chargeType: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
});

module.exports = mongoose.model('otherCharge', otherChargeSchema);