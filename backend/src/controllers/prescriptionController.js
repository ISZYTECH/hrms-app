const asyncHandler = require("express-async-handler");
const Prescription = require("../models/Prescription");
const { notifyUser } = require("../services/notifyUser");
const User = require("../models/User");

// @route  POST /api/prescriptions
// @access Private/Doctor
const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, medication, dosage, frequency, duration, startDate, endDate, instructions, refills } = req.body;

  if (!patientId || !medication || !dosage || !frequency || !duration) {
    res.status(400);
    throw new Error("Required fields missing");
  }

  const prescription = await Prescription.create({
    patient: patientId,
    doctor: req.user._id,
    medication,
    dosage,
    frequency,
    duration,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    instructions,
    refills: refills || 0,
    refillsRemaining: refills || 0,
  });

  await prescription.populate("patient", "name email phone");
  await prescription.populate("doctor", "name specialty");

  // Notify patient
  const patient = await User.findById(patientId);
  await notifyUser({
    user: patient,
    subject: "New Prescription",
    message: `Dr. ${req.user.name} has prescribed ${medication}. Please collect from the pharmacy.`,
  }).catch((e) => console.error(e.message));

  res.status(201).json(prescription);
});

// @route  GET /api/prescriptions
// @access Private
const listPrescriptions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") filter.patient = req.user._id;
  else if (req.user.role === "doctor") filter.doctor = req.user._id;

  const prescriptions = await Prescription.find(filter)
    .populate("patient", "name email")
    .populate("doctor", "name specialty")
    .sort({ createdAt: -1 });

  res.json(prescriptions);
});

// @route  PATCH /api/prescriptions/:id
// @access Private/Doctor
const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  if (req.user.role === "doctor" && prescription.doctor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  Object.assign(prescription, req.body);
  await prescription.save();

  res.json(prescription);
});

// @route  PATCH /api/prescriptions/:id/refill
// @access Private/Patient
const requestRefill = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }

  if (prescription.patient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (prescription.refillsRemaining <= 0) {
    res.status(400);
    throw new Error("No refills remaining. Contact your doctor.");
  }

  prescription.refillsRemaining -= 1;
  await prescription.save();

  res.json({ message: "Refill requested", prescription });
});

module.exports = { createPrescription, listPrescriptions, updatePrescription, requestRefill };
