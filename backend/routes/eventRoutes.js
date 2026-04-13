const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const { createEvent, getAllEvents } = require("../controllers/eventController");

router.get("/", getAllEvents);
router.post("/", verifyToken, checkRole("Organizer"), createEvent);

module.exports = router;