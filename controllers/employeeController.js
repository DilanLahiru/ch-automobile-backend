const Employee = require('../models/employeeModel');


const createEmployee = async (req, res) => {
    const { name, email, contactNumber, address, nicNumber } = req.body;

    if (!name || !email || !contactNumber || !address || !nicNumber) {
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
            createdAt: Date.now(),
        });
        const savedEmployee = await employee.save();
        res.status(201).json({
            message: 'Employee created successfully',
            employee: savedEmployee,
        });
    } catch (error) {
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

// Update employee
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, email, contactNumber, address, nicNumber, epfNumber } = req.body;

    if (!name || !email || !contactNumber || !address || !nicNumber || !epfNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const employee = await Employee.findByIdAndUpdate(id, {
            name,
            email,
            contactNumber,
            address,
            nicNumber,
            epfNumber,
        });
        res.status(200).json({
            message: 'Employee updated successfully',
            employee,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating employee' });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Employee deleted successfully',
            employee,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee' });
    }
};

module.exports = { createEmployee, getEmployees, updateEmployee, deleteEmployee };