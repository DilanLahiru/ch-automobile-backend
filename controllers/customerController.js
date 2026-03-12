const Customer = require('../models/customerModel');
const { generatePassword } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../utils/emailService');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerCustomer = async (req, res) => {
    const { name, email, contactNumber } = req.body;

    if (!name || !email || !contactNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    try {
        // Generate a default password
        const defaultPassword = generatePassword(12);

        // Hash the password before saving
        const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

        const customer = new Customer({
            name,
            email,
            contactNumber,
            password: hashedPassword,
        });

        const savedCustomer = await customer.save();

        // Send welcome email with the password
        const emailSent = await sendWelcomeEmail(email, name, defaultPassword);

        console.log(emailSent);
        

        res.status(201).json({
            message: 'Customer registered successfully',
            customer: {
                _id: savedCustomer._id,
                name: savedCustomer.name,
                email: savedCustomer.email,
                contactNumber: savedCustomer.contactNumber,
            },
            emailSent: emailSent,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating customer' });
    }
}

const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const isPasswordCorrect = await bcryptjs.compare(password, customer.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ _id: customer._id }, process.env.JWT_SECRET_KEY);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                contactNumber: customer.contactNumber,
            },
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error logging in' });
    }
};

const loadAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
}

module.exports = { registerCustomer, loadAllCustomers, loginCustomer };