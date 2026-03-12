const express = require("express");
const {createServiceRecord, getServiceRecords, getServiceRecordsByCustomerId} = require("../controllers/serviceRecordController");

const router = express.Router();

router.post("/create", createServiceRecord);
router.get("/all", getServiceRecords);
router.get("/load/:customerId", getServiceRecordsByCustomerId);

module.exports = router;