const express = require('express');
const router = express.Router();

const {registerCustomer, loadAllCustomers, loginCustomer} = require('../controllers/customerController');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/all', loadAllCustomers);


module.exports = router;