const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// @route  GET /api/users?role=doctor
// @access Private (any authenticated user can look up doctors; admin can list all)
const listUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = {};

  if (role) {
    filter.role = role;
  } else if (req.user.role !== "admin") {
    // Non-admins must filter by role (e.g. to find doctors) — they can't dump the whole user table.
    res.status(403);
    throw new Error("Specify a role to search, e.g. /api/users?role=doctor");
  }

  const users = await User.find(filter).sort({ name: 1 });
  res.json(users.map((u) => u.toSafeObject()));
});

// @route  GET /api/users/:id
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.toSafeObject());
});

// @route  PATCH /api/users/:id
// @access Private (self or admin)
const updateUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
    res.status(403);
    throw new Error("You can only update your own profile");
  }

  const disallowed = ["password", "role"]; // role changes & password resets go through dedicated routes
  const updates = { ...req.body };
  disallowed.forEach((f) => delete updates[f]);

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.toSafeObject());
});

// @route  PATCH /api/users/:id/role
// @access Private/Admin
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["patient", "doctor", "lab", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.toSafeObject());
});

// @route  PATCH /api/users/:id/deactivate
// @access Private/Admin
const setActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(isActive) }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user.toSafeObject());
});

module.exports = { listUsers, getUser, updateUser, changeRole, setActive };
