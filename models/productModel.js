const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'supplier',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
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
  initialStock: {
    type: Number,
    required: true,
  },
  minimumStock: {
    type: Number,
    required: true,
  },
  categoryName: {
    type: String,
  },
  supplierName: {
    type: String,
  },
});

module.exports = mongoose.model('product', productSchema);