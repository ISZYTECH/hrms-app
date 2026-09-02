const express = require("express");
const { myNotifications, adminStats } = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/notifications/me", myNotifications);
router.get("/admin/stats", authorize("admin"), adminStats);

module.exports = router;
