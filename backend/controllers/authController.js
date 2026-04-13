const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendActivationEmail } = require("../utils/sendEmail");

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("REGISTER REQUEST:", { name, email, role });

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user — NOT verified yet
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      isVerified: false,
      activationToken,
      activationExpire,
    });

    console.log("NEW USER CREATED:", newUser._id, newUser.email);

    // Send activation email
    await sendActivationEmail(normalizedEmail, name, activationToken);
    console.log("ACTIVATION EMAIL SENT TO:", normalizedEmail);

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to activate your account.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    next(err);
  }
};

// GET /api/auth/activate/:token
exports.activate = async (req, res, next) => {
  try {
    const user = await User.findOne({
      activationToken: req.params.token,
      activationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired activation link. Please register again.",
      });
    }

    user.isVerified = true;
    user.activationToken = undefined;
    user.activationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Account activated successfully! You can now login.",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    console.log("LOGIN REQUEST:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please activate your email first",
      });
    }

    console.log("LOGIN SUCCESS:", user.email, user.role);

    res.json({
      success: true,
      token: signToken(user),
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    next(err);
  }
};