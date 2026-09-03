const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g., "twice daily", "every 8 hours"
    duration: { type: String, required: true }, // e.g., "7 days", "2 weeks"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    instructions: { type: String }, // Special instructions
    status: {
      type: String,
      enum: ["active", "completed", "discontinued"],
      default: "active",
    },
    refills: { type: Number, default: 0 },
    refillsRemaining: { type: Number, default: 0 },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient: 1, status: 1 });
prescriptionSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
