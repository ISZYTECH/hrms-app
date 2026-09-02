const asyncHandler = require("express-async-handler");
const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");

// @route  POST /api/records
// @access Private/Doctor
const createRecord = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, diagnosis, prescription, notes } = req.body;
  if (!patientId || !diagnosis) {
    res.status(400);
    throw new Error("patientId and diagnosis are required");
  }

  const patient = await User.findOne({ _id: patientId, role: "patient" });
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: req.user._id,
    appointment: appointmentId || undefined,
    diagnosis,
    prescription: prescription || [],
    notes,
  });

  res.status(201).json(record);
});

// @route  GET /api/records/patient/:patientId
// @access Private (patient themself, their doctors, or admin)
const listByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (req.user.role === "patient" && req.user._id.toString() !== patientId) {
    res.status(403);
    throw new Error("You can only view your own records");
  }

  const records = await MedicalRecord.find({ patient: patientId })
    .populate("doctor", "name specialty")
    .sort({ createdAt: -1 });

  res.json(records);
});

module.exports = { createRecord, listByPatient };
