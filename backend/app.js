require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./src/middleware/errorHandler");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const recordRoutes = require("./src/routes/recordRoutes");
const labRoutes = require("./src/routes/labRoutes");
const miscRoutes = require("./src/routes/miscRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const pharmacyRoutes = require("./src/routes/pharmacyRoutes");
const billingRoutes = require("./src/routes/billingRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const auditRoutes = require("./src/routes/auditRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Core routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/lab-results", labRoutes);
app.use("/api", miscRoutes); // /api/notifications/me, /api/admin/stats

// New hospital management routes
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/audit", auditRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
