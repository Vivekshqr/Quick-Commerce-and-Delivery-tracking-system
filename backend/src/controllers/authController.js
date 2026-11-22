const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret } = require("../config/env");

const signToken = (user) =>
  jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: "1h" });

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !["customer", "delivery"].includes(role)) {
    return res.status(400).json({ message: "Name, email, password and a valid role are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: normalizedEmail, password: hashedPassword, role });
  res.status(201).json({ token: signToken(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  res.status(200).json({ token: signToken(user) });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
}

module.exports = { register, login, me };
