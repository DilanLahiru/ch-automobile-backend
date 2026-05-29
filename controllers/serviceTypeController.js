const serviceTypeModel = require("../models/serviceTypeModel");

const createServiceType = async (req, res) => {
    const { name, price } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const serviceType = new serviceTypeModel({
            name,
            price,
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

// Update Service Type using ID
const updateServiceType = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    try {
        const updatedServiceType = await serviceTypeModel.findByIdAndUpdate(
            id,
            { name, price },
        );
        res.status(200).json({
            message: 'Service Type updated successfully',
            serviceType: updatedServiceType,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service type' });
    }
};

module.exports = {
    createServiceType,
    getServiceTypes,
    updateServiceType,
};