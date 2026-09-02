const Notification = require("../models/Notification");

function isConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER
  );
}

function getClient() {
  // Lazy-required so the app can run without the twilio package needing real credentials at boot.
  const twilio = require("twilio");
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Sends a real SMS if Twilio is configured, otherwise logs and records it as "simulated".
async function sendSMS({ user, message, relatedAppointment }) {
  const log = { user: user._id, channel: "sms", message, relatedAppointment };

  if (!isConfigured() || !user.phone) {
    console.log(`[SMS - SIMULATED] To: ${user.phone || "(no phone on file)"} | ${message}`);
    return Notification.create({ ...log, status: "simulated" });
  }

  try {
    const client = getClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
    return Notification.create({ ...log, status: "sent" });
  } catch (err) {
    console.error("SMS send failed:", err.message);
    return Notification.create({ ...log, status: "failed", error: err.message });
  }
}

// Places a real automated voice call if Twilio is configured, otherwise logs and simulates it.
async function sendVoiceCall({ user, message, relatedAppointment }) {
  const log = { user: user._id, channel: "call", message, relatedAppointment };

  if (!isConfigured() || !user.phone) {
    console.log(`[CALL - SIMULATED] To: ${user.phone || "(no phone on file)"} | "${message}"`);
    return Notification.create({ ...log, status: "simulated" });
  }

  try {
    const client = getClient();
    const twiml = `<Response><Say>${message}</Say></Response>`;
    await client.calls.create({
      twiml,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
    return Notification.create({ ...log, status: "sent" });
  } catch (err) {
    console.error("Voice call failed:", err.message);
    return Notification.create({ ...log, status: "failed", error: err.message });
  }
}

module.exports = { sendSMS, sendVoiceCall, isConfigured };
