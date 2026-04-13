const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
  bookTicket,
  getMyTickets,
  verifyTicket,
  checkInTicket,
  cancelTicket,
  downloadEPass,
} = require("../controllers/ticketController");

// Attendee routes
router.post("/book",                verifyToken, checkRole("attendee"), bookTicket);
router.get("/my",                   verifyToken, checkRole("attendee"), getMyTickets);
router.get("/epass/:ticketId",      verifyToken, checkRole("attendee"), downloadEPass);
router.post("/cancel/:ticketId",    verifyToken, checkRole("attendee"), cancelTicket);

// Public route — no login needed
router.get("/verify/:ticketId", verifyTicket);

// Organizer check-in
router.post("/checkin/:ticketId",   verifyToken, checkRole("organizer", "admin"), checkInTicket);

module.exports = router;