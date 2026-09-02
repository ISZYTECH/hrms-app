require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
const startReminderScheduler = require("./src/services/reminderScheduler");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  startReminderScheduler();
  app.listen(PORT, () => {
    console.log(`HRMS backend running on http://localhost:${PORT}`);
  });
}

start();
