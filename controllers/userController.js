const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Hash the password before saving
    const hashedPassword = await bcryptjs.hash(password, 10);

    try {
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const savedUser = await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: savedUser,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating user' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcryptjs.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error logging in' });
    }   
};



module.exports = { createUser, loginUser };