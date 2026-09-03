const asyncHandler = require("express-async-handler");
const AuditLog = require("../models/AuditLog");

// Internal function to log actions
const logAction = async (req, action, entityType, entityId, changes, description) => {
  try {
    await AuditLog.create({
      user: req.user?._id,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      description,
    });
  } catch (err) {
    console.error("Error logging audit:", err.message);
  }
};

// @route  GET /api/audit/logs
// @access Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const { user, action, entityType, startDate, endDate } = req.query;
  const filter = {};

  if (user) filter.user = user;
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(filter)
    .populate("user", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});

// @route  GET /api/audit/logs/entity/:entityType/:entityId
// @access Private/Admin
const getEntityAuditTrail = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const logs = await AuditLog.find({ entityType, entityId })
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(logs);
});

module.exports = { getAuditLogs, getEntityAuditTrail, logAction };
