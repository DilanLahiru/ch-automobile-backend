const Employee = require('../models/employeeModel');


const createEmployee = async (req, res) => {
    const { name, email, contactNumber, address, nicNumber, epfNumber } = req.body;

    if (!name || !email || !contactNumber || !address || !nicNumber || !epfNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    try {
        const employee = new Employee({
            name,
            email,
            contactNumber,
            address,
            nicNumber,
            epfNumber,
            createdAt: Date.now(),
        });
        const savedEmployee = await employee.save();
        res.status(201).json({
            message: 'Employee created successfully',
            employee: savedEmployee,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating employee' });
    }
};

// Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees' });
    }
};

module.exports = { createEmployee, getEmployees };