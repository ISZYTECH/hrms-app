require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
const startReminderScheduler = require("./src/services/reminderScheduler");
const startAdvancedReminderScheduler = require("./src/services/advancedReminderScheduler");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  startReminderScheduler();
  startAdvancedReminderScheduler(); // Advanced 48h & 24h reminders
  app.listen(PORT, () => {
    console.log(`HRMS backend running on http://localhost:${PORT}`);
    console.log("✅ Reminder schedulers started (24h and advanced 48h/24h)");
  });
}

start();
