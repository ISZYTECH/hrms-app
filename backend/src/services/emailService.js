const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// Sends a real email if SMTP is configured, otherwise logs and records it as "simulated"
// so the rest of the notification flow (appointment reminders, etc.) still works end-to-end
// in a development/demo environment without real credentials.
async function sendEmail({ user, subject, message, relatedAppointment }) {
  const log = { user: user._id, channel: "email", subject, message, relatedAppointment };

  if (!isConfigured()) {
    console.log(`[EMAIL - SIMULATED] To: ${user.email} | Subject: ${subject}\n${message}`);
    return Notification.create({ ...log, status: "simulated" });
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "HRMS <no-reply@hrms.local>",
      to: user.email,
      subject,
      text: message,
    });
    return Notification.create({ ...log, status: "sent" });
  } catch (err) {
    console.error("Email send failed:", err.message);
    return Notification.create({ ...log, status: "failed", error: err.message });
  }
}

module.exports = { sendEmail, isConfigured };
