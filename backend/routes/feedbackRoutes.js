const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const { addFeedback } = require("../controllers/feedbackController");

router.post("/", verifyToken, checkRole("Attendee"), addFeedback);

module.exports = router;