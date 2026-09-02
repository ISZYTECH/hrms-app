require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const mongoose = require("mongoose");

const demoUsers = [
  { name: "Admin User", email: "admin@hrms.local", password: "password123", role: "admin", phone: "+2340000000001" },
  {
    name: "Dr. Ada Obi",
    email: "doctor@hrms.local",
    password: "password123",
    role: "doctor",
    specialty: "General Medicine",
    phone: "+2340000000002",
  },
  { name: "Lab Tech Musa", email: "lab@hrms.local", password: "password123", role: "lab", phone: "+2340000000003" },
  {
    name: "Israel Patient",
    email: "patient@hrms.local",
    password: "password123",
    role: "patient",
    phone: "+2340000000004",
  },
];

async function seed() {
  await connectDB();
  for (const u of demoUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipping (already exists): ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`Created: ${u.email} / password123 (role: ${u.role})`);
  }
  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
