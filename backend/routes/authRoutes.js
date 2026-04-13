const express = require("express");
const router = express.Router();
const { register, activate, login } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.get("/activate/:token", activate);
router.post("/login", login);

module.exports = router;