const express = require("express");
const { uploadResult, listByPatient } = require("../controllers/labController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/", authorize("lab"), uploadResult);
router.get("/patient/:patientId", listByPatient);

module.exports = router;
