const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { notifyUser } = require("../services/notifyUser");

// @route  POST /api/appointments
// @access Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, reason } = req.body;
  if (!doctorId || !date || !reason) {
    res.status(400);
    throw new Error("doctorId, date, and reason are required");
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date,
    reason,
  });

  notifyUser({
    user: doctor,
    subject: "New Appointment Request",
    message: `${req.user.name} has requested an appointment on ${new Date(date).toLocaleString()}. Reason: ${reason}.`,
  }).catch((e) => console.error(e.message));

  res.status(201).json(appointment);
});

// @route  GET /api/appointments
// @access Private (scoped by role)
const listAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") filter.patient = req.user._id;
  else if (req.user.role === "doctor") filter.doctor = req.user._id;
  // admin sees all; lab role has no appointment view by default

  const appointments = await Appointment.find(filter)
    .populate("patient", "name email phone")
    .populate("doctor", "name specialty")
    .sort({ date: 1 });

  res.json(appointments);
});

// @route  PATCH /api/appointments/:id/status
// @access Private/Doctor,Admin
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const appointment = await Appointment.findById(req.params.id).populate("patient").populate("doctor", "name");
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (req.user.role === "doctor" && appointment.doctor._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update your own appointments");
  }

  appointment.status = status;
  await appointment.save();

  notifyUser({
    user: appointment.patient,
    subject: "Appointment Update",
    message: `Your appointment with Dr. ${appointment.doctor.name} on ${appointment.date.toLocaleString()} is now ${status}.`,
    relatedAppointment: appointment._id,
  }).catch((e) => console.error(e.message));

  res.json(appointment);
});

module.exports = { bookAppointment, listAppointments, updateStatus };
