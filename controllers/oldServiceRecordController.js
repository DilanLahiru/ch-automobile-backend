const oldServiceRecordModel = require("../models/oldServiceRecordModel");

// Create a new old service record
const createOldServiceRecord = async (req, res) => {
    const { customerName, contactNumber, vehicleNumber, serviceDate, serviceSummary } = req.body;

    if (!customerName || !contactNumber || !vehicleNumber || !serviceDate || !serviceSummary) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const oldServiceRecord = new oldServiceRecordModel({
            customerName,
            contactNumber,
            vehicleNumber,
            serviceDate,
            serviceSummary,
        });
        await oldServiceRecord.save();
        res.status(201).json({ message: 'Old service record created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error creating old service record' });
    }
};

// Get all old service records and sort by date
const getOldServiceRecords = async (req, res) => {
    try {
        const oldServiceRecords = await oldServiceRecordModel.find().sort({ serviceDate: -1 });
        res.status(200).json(oldServiceRecords);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching old service records' });
    }
};

module.exports = { createOldServiceRecord, getOldServiceRecords };