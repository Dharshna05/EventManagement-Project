const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
  getAllUsers,
  changeUserRole,
  deleteUser,
  getAllEvents,
  toggleEventPublish,
  getPlatformStats,
} = require("../controllers/adminController");

router.use(verifyToken, checkRole("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);
router.get("/events", getAllEvents);
router.put("/events/:id/toggle", toggleEventPublish);
router.get("/stats", getPlatformStats);

module.exports = router;