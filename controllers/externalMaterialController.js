const ExternalMaterial = require('../models/externalMaterialModel');

const createExternalMaterial = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Missing required field' });
    }

    const existingExternalMaterial = await ExternalMaterial.findOne({ name });

    if (existingExternalMaterial) {
        return res.status(400).json({ message: 'Name already exists' });
    }

    try {
        const externalMaterial = new ExternalMaterial({ name });
        const savedExternalMaterial = await externalMaterial.save();
        res.status(201).json({
            message: 'External material created successfully',
            externalMaterial: savedExternalMaterial,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating external material' });
    }
};

// Get all external materials
const getExternalMaterials = async (req, res) => {
    try {
        const externalMaterials = await ExternalMaterial.find();
        res.status(200).json(externalMaterials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching external materials' });
    }
};

module.exports = {
    createExternalMaterial,
    getExternalMaterials,
};