const serviceTypeModel = require("../models/serviceTypeModel");

const createServiceType = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const serviceType = new serviceTypeModel({
            name,
        });
        const savedServiceType = await serviceType.save();
        res.status(201).json({
            message: 'Service Type created successfully',
            serviceType: savedServiceType,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating service type' });
    }
};

// Load All Service Types
const getServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await serviceTypeModel.find();
        res.status(200).json(serviceTypes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service types' });
    }
};

module.exports = {
    createServiceType,
    getServiceTypes,
};