const rateLimit = require("express-rate-limit");
const { clientUrls } = require("../config/env");

const json = (message) => ({ message });

// Whole API: generous limit to stop floods.
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false, message: json("Too many requests, slow down.") });

// Login: 10 failed attempts per 15 minutes per IP (successful logins don't count).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many failed login attempts. Try again in 15 minutes."),
});

// Sign-ups: 50 per hour per IP.
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 50, standardHeaders: "draft-7", legacyHeaders: false, message: json("Too many sign-ups from this network. Try again later.") });

// Password reset requests: 5 per 15 minutes per IP.
const passwordResetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false, message: json("Too many password reset requests. Try again in 15 minutes.") });

// Extra CSRF guard for cookie auth: state-changing requests from a browser must come from the frontend's origin.
function checkOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !clientUrls.includes(origin)) return res.status(403).json({ message: "Origin not allowed" });
  next();
}

module.exports = { apiLimiter, loginLimiter, registerLimiter, passwordResetLimiter, checkOrigin };
