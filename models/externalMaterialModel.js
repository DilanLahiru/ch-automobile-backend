const mongoose = require('mongoose');

const externalMaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('externalMaterial', externalMaterialSchema);