const router = require("express").Router();
const c = require("../controllers/authController");
const v = require("../middleware/validators");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { loginLimiter, registerLimiter, passwordResetLimiter } = require("../middleware/security");

router.post("/register", registerLimiter, v.register, asyncHandler(c.register));
router.post("/login", loginLimiter, v.login, asyncHandler(c.login));
router.post("/logout", asyncHandler(c.logout));
router.get("/me", authenticate, asyncHandler(c.me));
router.post("/forgot-password", passwordResetLimiter, v.forgotPassword, asyncHandler(c.forgotPassword));
router.post("/reset-password", passwordResetLimiter, v.resetPassword, asyncHandler(c.resetPassword));

module.exports = router;
