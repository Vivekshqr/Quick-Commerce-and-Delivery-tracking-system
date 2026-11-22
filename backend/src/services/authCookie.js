const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn, cookieName, isProduction } = require("../config/env");

const DAY = 24 * 60 * 60 * 1000;

const signToken = (user) =>
  jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

const cookieOptions = () => ({
  httpOnly: true, // not readable from JavaScript
  sameSite: "lax", // not sent on cross-site POSTs (CSRF protection)
  secure: isProduction, // HTTPS only in production
  path: "/",
});

// Log the user in by setting the JWT as an httpOnly cookie.
function setAuthCookie(res, user) {
  res.cookie(cookieName, signToken(user), { ...cookieOptions(), maxAge: DAY });
}

function clearAuthCookie(res) {
  res.clearCookie(cookieName, cookieOptions());
}

// Read the token from the cookie (browser) or an Authorization header (API clients).
function readToken(req) {
  return req.cookies?.[cookieName] || req.headers.authorization?.split(" ")[1] || null;
}

// Same, for a raw "Cookie" header (Socket.IO handshake).
function readTokenFromCookieHeader(header = "") {
  const part = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${cookieName}=`));
  return part ? decodeURIComponent(part.slice(cookieName.length + 1)) : null;
}

module.exports = { signToken, setAuthCookie, clearAuthCookie, readToken, readTokenFromCookieHeader };
