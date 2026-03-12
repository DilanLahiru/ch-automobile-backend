const express = require('express');
const router = express.Router();

const {createEmployee, getEmployees} = require('../controllers/employeeController');

router.post('/create', createEmployee);
router.get('/all', getEmployees);

module.exports = router;    