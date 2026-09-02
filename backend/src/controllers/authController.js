const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { notifyUser } = require("../services/notifyUser");

// @route  POST /api/auth/register
// @access Public (admins are seeded separately, not self-registered — see notes below)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, specialty, dateOfBirth, gender } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Self-registration is limited to patient/doctor/lab. Admin accounts should be
  // created by an existing admin via POST /api/users (protected route) or the seed script.
  const allowedSelfRoles = ["patient", "doctor", "lab"];
  const finalRole = allowedSelfRoles.includes(role) ? role : "patient";

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: finalRole,
    specialty,
    dateOfBirth,
    gender,
  });

  notifyUser({
    user,
    subject: "Welcome to HRMS",
    message: `Hi ${user.name}, your ${user.role} account has been created successfully.`,
  }).catch((e) => console.error("Welcome notification failed:", e.message));

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
