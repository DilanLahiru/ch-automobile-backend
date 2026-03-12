const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: Number,
    required: true,
  },
}); 

module.exports = mongoose.model('supplier', supplierSchema);