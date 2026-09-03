const mongoose = require("mongoose");

const advancedNotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "appointment_reminder_48h",
        "appointment_reminder_24h",
        "appointment_confirmed",
        "appointment_cancelled",
        "lab_result_ready",
        "prescription_ready",
        "bill_generated",
        "bill_overdue",
        "medication_refill_due",
        "general_alert",
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms", "call", "in_app"],
      required: true,
    },
    subject: { type: String },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "simulated"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "delivered", "read", "failed"],
      default: "pending",
    },
    readAt: { type: Date },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    relatedBill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
    relatedLabResult: { type: mongoose.Schema.Types.ObjectId, ref: "LabResult" },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
  },
  { timestamps: true }
);

advancedNotificationSchema.index({ recipient: 1, createdAt: -1 });
advancedNotificationSchema.index({ status: 1 });
advancedNotificationSchema.index({ sentAt: 1 });

module.exports = mongoose.model("AdvancedNotification", advancedNotificationSchema);
