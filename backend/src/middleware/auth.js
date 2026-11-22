const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

// Verifies "Authorization: Bearer <token>" and puts the payload on req.user.
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Only lets users with the given role through.
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ message: "Forbidden" });
  next();
};

module.exports = { authenticate, requireRole };
