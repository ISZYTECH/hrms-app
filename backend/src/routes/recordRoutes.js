const express = require("express");
const { createRecord, listByPatient } = require("../controllers/recordController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("doctor"), createRecord);
router.get("/patient/:patientId", listByPatient);

module.exports = router;
