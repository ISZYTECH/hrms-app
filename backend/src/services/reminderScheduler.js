const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const { notifyUser } = require("./notifyUser");

// Runs every hour: finds confirmed appointments happening in the next 24 hours
// that haven't had a reminder sent yet, and notifies the patient.
function startReminderScheduler() {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcoming = await Appointment.find({
        status: "confirmed",
        reminderSent: false,
        date: { $gte: now, $lte: in24h },
      })
        .populate("patient")
        .populate("doctor", "name specialty");

      for (const appt of upcoming) {
        const when = appt.date.toLocaleString();
        await notifyUser({
          user: appt.patient,
          subject: "Appointment Reminder",
          message: `Reminder: you have an appointment with Dr. ${appt.doctor.name} on ${when}. Reason: ${appt.reason}.`,
          relatedAppointment: appt._id,
        });
        appt.reminderSent = true;
        await appt.save();
      }

      if (upcoming.length) {
        console.log(`Sent ${upcoming.length} appointment reminder(s).`);
      }
    } catch (err) {
      console.error("Reminder scheduler error:", err.message);
    }
  });

  console.log("Appointment reminder scheduler started (runs hourly).");
}

module.exports = startReminderScheduler;
