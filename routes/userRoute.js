const express = require('express');
const router = express.Router();

const {createUser, loginUser, updateUserPassword, getUserProfile, updateUserProfile} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/create', createUser);
router.post('/login', loginUser);
router.put('/update-password', authMiddleware, updateUserPassword);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/update-profile', authMiddleware, updateUserProfile);


module.exports = router;