const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true },
    prescription: [
      {
        medication: { type: String, required: true },
        dosage: { type: String },
        instructions: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
