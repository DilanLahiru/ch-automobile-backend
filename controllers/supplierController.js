const supplierModel = require("../models/supplierModel");

// Create Supplier
const createSupplier = async (req, res) => {
    const { name, contactNumber } = req.body;

    if (!name || !contactNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingSupplier = await supplierModel.findOne({ contactNumber });

    if (existingSupplier) {
        return res.status(400).json({ message: 'Contact number already exists' });
    }

    try {
        const supplier = new supplierModel({
            name,
            contactNumber,
        });
        const savedSupplier = await supplier.save();
        res.status(201).json({
            message: 'Supplier created successfully',
            supplier: savedSupplier,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating supplier' });
    }
};

// Load All Suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierModel.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers' });
    }
};

module.exports = { createSupplier, getSuppliers };