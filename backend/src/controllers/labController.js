const asyncHandler = require("express-async-handler");
const LabResult = require("../models/LabResult");
const User = require("../models/User");
const { notifyUser } = require("../services/notifyUser");

// @route  POST /api/lab-results
// @access Private/Lab
const uploadResult = asyncHandler(async (req, res) => {
  const { patientId, testName, result, normalRange, notes } = req.body;
  if (!patientId || !testName || !result) {
    res.status(400);
    throw new Error("patientId, testName, and result are required");
  }

  const patient = await User.findOne({ _id: patientId, role: "patient" });
  if (!patient) {
    res.status(404);
    throw new Error("Patient not found");
  }

  const labResult = await LabResult.create({
    patient: patientId,
    uploadedBy: req.user._id,
    testName,
    result,
    normalRange,
    notes,
  });

  notifyUser({
    user: patient,
    subject: "New Lab Result Available",
    message: `Your results for "${testName}" are now available in your HRMS record.`,
  }).catch((e) => console.error(e.message));

  res.status(201).json(labResult);
});

// @route  GET /api/lab-results/patient/:patientId
// @access Private (patient themself, lab staff, doctors, or admin)
const listByPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (req.user.role === "patient" && req.user._id.toString() !== patientId) {
    res.status(403);
    throw new Error("You can only view your own lab results");
  }

  const results = await LabResult.find({ patient: patientId })
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 });

  res.json(results);
});

module.exports = { uploadResult, listByPatient };
