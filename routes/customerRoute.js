const express = require('express');
const router = express.Router();

const {registerCustomer, loadAllCustomers, loginCustomer, deleteCustomer, updateCustomer} = require('../controllers/customerController');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/all', loadAllCustomers);
router.delete('/delete/:id', deleteCustomer);
router.put('/update/:id', updateCustomer);


module.exports = router;