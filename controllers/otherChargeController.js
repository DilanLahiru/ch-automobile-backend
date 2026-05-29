const otherChargeModel = require("../models/otherChargeModel");

const createOtherCharge = async (req, res) => {
    const { chargeType, amount } = req.body;

    if (!chargeType) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const otherCharge = new otherChargeModel({
            chargeType,
            amount,
        });
        const savedOtherCharge = await otherCharge.save();
        res.status(201).json({
            message: 'Other Charge created successfully',
            otherCharge: savedOtherCharge,
        });
    } catch (error) {
        console.log('Error creating other charge:', error);
        res.status(500).json({ message: 'Error creating other charge' });
    }
};

// Load All Other Charges
const getOtherCharges = async (req, res) => {
    try {
        const otherCharges = await otherChargeModel.find();
        res.status(200).json(otherCharges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching other charges' });
    }
};

// Update Other Charge using ID
const updateOtherCharge = async (req, res) => {
    const { id } = req.params;
    const { chargeType, amount } = req.body;

    try {
        const updatedOtherCharge = await otherChargeModel.findByIdAndUpdate(
            id,
            { chargeType, amount },
        );
        res.status(200).json({
            message: 'Other Charge updated successfully',
            otherCharge: updatedOtherCharge,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating other charge', error: error.message });
    }
};

module.exports = {
    createOtherCharge,
    getOtherCharges,
    updateOtherCharge,
};