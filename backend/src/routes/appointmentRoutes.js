const express = require("express");
const { bookAppointment, listAppointments, updateStatus } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("patient"), bookAppointment);
router.get("/", listAppointments);
router.patch("/:id/status", authorize("doctor", "admin"), updateStatus);

module.exports = router;
