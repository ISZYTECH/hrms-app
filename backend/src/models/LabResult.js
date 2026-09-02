const mongoose = require("mongoose");

const labResultSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testName: { type: String, required: true, trim: true },
    result: { type: String, required: true },
    normalRange: { type: String },
    notes: { type: String },
    status: { type: String, enum: ["pending", "completed"], default: "completed" },
  },
  { timestamps: true }
);

labResultSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("LabResult", labResultSchema);
