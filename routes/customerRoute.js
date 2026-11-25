const express = require('express');
const router = express.Router();

const {registerCustomer, loadAllCustomers, loginCustomer, deleteCustomer, updateCustomer, requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp, updatePassword } = require('../controllers/customerController');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/all', loadAllCustomers);
router.delete('/delete/:id', deleteCustomer);
router.put('/update/:id', updateCustomer);
router.post('/password-reset/request-otp', requestPasswordResetOtp);
router.post('/password-reset/verify-otp', verifyPasswordResetOtp);
router.put('/password-reset/reset', resetPasswordWithOtp);
router.put('/update-password/:id', updatePassword);


module.exports = router;