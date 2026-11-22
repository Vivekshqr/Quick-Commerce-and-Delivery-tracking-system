const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { clientUrls } = require("../config/env");
const { setAuthCookie, clearAuthCookie } = require("../services/authCookie");

const RESET_TTL_MS = 15 * 60 * 1000;
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register  (input checked by validators.register)
async function register(req, res) {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });
  setAuthCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  setAuthCookie(res, user);
  res.status(200).json({ user: publicUser(user) });
}

// POST /api/auth/logout
async function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
}

// POST /api/auth/forgot-password { email }
// There is no email service, so the reset link is printed to the backend console/log (dev only).
async function forgotPassword(req, res) {
  const generic = { message: "If that email is registered, a reset link has been created. (Dev: check the backend console/log.)" };
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json(generic); // don't reveal which emails exist

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordHash = sha256(token);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
  await user.save();

  const link = `${clientUrls[0]}/reset-password?token=${token}`;
  console.log(`\n[password reset] ${user.email}\n  Reset link (valid 15 min): ${link}\n`);
  res.json(generic);
}

// POST /api/auth/reset-password { token, password }
async function resetPassword(req, res) {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordHash: sha256(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordHash +resetPasswordExpires");
  if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired. Request a new one." });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  clearAuthCookie(res);
  console.log(`[password reset] password changed for ${user.email}`);
  res.json({ message: "Password updated. You can log in now." });
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
