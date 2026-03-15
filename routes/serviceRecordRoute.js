const express = require("express");
const {createServiceRecord, getServiceRecords, getServiceRecordsByCustomerId, getServiceRecordsByEmployeeId} = require("../controllers/serviceRecordController");

const router = express.Router();

router.post("/create", createServiceRecord);
router.get("/all", getServiceRecords);
router.get("/load/:customerId", getServiceRecordsByCustomerId);
router.get("/employee/:employeeId", getServiceRecordsByEmployeeId);

module.exports = router;