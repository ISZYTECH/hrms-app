const { sendEmail } = require("./emailService");
const { sendSMS, sendVoiceCall } = require("./smsService");

// Sends a notification through every channel the user has opted into.
async function notifyUser({ user, subject, message, relatedAppointment }) {
  const jobs = [];
  const prefs = user.notifyBy || { email: true, sms: false, call: false };

  if (prefs.email !== false) jobs.push(sendEmail({ user, subject, message, relatedAppointment }));
  if (prefs.sms) jobs.push(sendSMS({ user, message, relatedAppointment }));
  if (prefs.call) jobs.push(sendVoiceCall({ user, message, relatedAppointment }));

  return Promise.all(jobs);
}

module.exports = { notifyUser };
