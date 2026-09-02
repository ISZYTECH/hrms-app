const express = require("express");
const { listUsers, getUser, updateUser, changeRole, setActive } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", listUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.patch("/:id/role", authorize("admin"), changeRole);
router.patch("/:id/deactivate", authorize("admin"), setActive);

module.exports = router;
