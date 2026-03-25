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
        res.status(500).json({ message: 'Error logging in' });
    }   
};

// Update a user's password
const updateUserPassword = async (req, res) => {
    const _id = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcryptjs.compare(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(_id, { password: hashedPassword }, { new: true });

        res.status(200).json({ message: 'Password updated successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password' });
    }
};

// Get profile of a user using token and remove password from response
const getUserProfile = async (req, res) => {
    const _id = req.userId;

    if (!_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user._doc;

        res.status(200).json( { user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

// Update a user's profile
const updateUserProfile = async (req, res) => {
    const _id = req.userId;
    const { name } = req.body;

    if (!_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await User.findByIdAndUpdate(_id, { name }, { new: true });

        const { password, ...userWithoutPassword } = updatedUser._doc;

        res.status(200).json( { user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile' });
    }
};



module.exports = { createUser, loginUser, updateUserPassword, getUserProfile, updateUserProfile };