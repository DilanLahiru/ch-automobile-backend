const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    serviceDate: {
        type: Date,
        required: true,
    },
    serviceSummary: {
        type: String,
    },
});

module.exports = mongoose.model('OldServiceRecord', serviceRecordSchema);