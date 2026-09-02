const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// @route  GET /api/notifications/me
// @access Private
const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
});

// @route  GET /api/admin/stats
// @access Private/Admin
const adminStats = asyncHandler(async (req, res) => {
  const [totalUsers, byRole, totalAppointments, upcomingAppointments, notificationsSent] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Appointment.countDocuments(),
    Appointment.countDocuments({ date: { $gte: new Date() }, status: { $in: ["pending", "confirmed"] } }),
    Notification.countDocuments(),
  ]);

  res.json({
    totalUsers,
    usersByRole: byRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
    totalAppointments,
    upcomingAppointments,
    notificationsSent,
  });
});

module.exports = { myNotifications, adminStats };
