const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, enum: ["email", "sms", "call"], required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ["sent", "simulated", "failed"], default: "simulated" },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
