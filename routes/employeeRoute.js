const express = require('express');
const router = express.Router();

const {createEmployee, getEmployees, updateEmployee, deleteEmployee} = require('../controllers/employeeController');

router.post('/create', createEmployee);
router.get('/all', getEmployees);
router.put('/update/:id', updateEmployee);
router.delete('/delete/:id', deleteEmployee);

module.exports = router;         