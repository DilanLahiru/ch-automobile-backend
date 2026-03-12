const express = require("express");
const router = express.Router();
const {
  createAppointment,
  createAppointmentWithCustomer,
  getAppointments,
  getAppointmentsByCustomerId,
  updateAppointment,
} = require("../controllers/appointmentController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createAppointment);
router.post("/create-guest", createAppointmentWithCustomer);
router.get("/all", authMiddleware, getAppointments);
router.get("/get-by-customer-id", authMiddleware, getAppointmentsByCustomerId);
router.put("/update/:id", authMiddleware, updateAppointment);

module.exports = router;
