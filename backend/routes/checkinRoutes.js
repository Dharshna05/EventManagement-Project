const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
  checkInTicket,
  getEventAnalytics,
} = require("../controllers/checkinController");

// ✅ Fixed roles to match User model — "Organizer" and "Admin" (capital first letter)
router.post("/", verifyToken, checkRole("Organizer", "Admin"), checkInTicket);

router.get(
  "/analytics/:eventId",
  verifyToken,
  checkRole("Organizer", "Admin"),
  getEventAnalytics
);

module.exports = router; 

