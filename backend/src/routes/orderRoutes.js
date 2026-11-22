const router = require("express").Router();
const c = require("../controllers/orderController");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const v = require("../middleware/validators");

router.use(authenticate);

router.post("/", requireRole("customer"), v.createOrder, asyncHandler(c.createOrder));
router.get("/pending", requireRole("delivery"), asyncHandler(c.getActiveOrders));
router.get("/customer/:id", v.idParam, asyncHandler(c.getCustomerOrders));
router.get("/history/:userId", v.userIdParam, asyncHandler(c.getOrderHistory));
router.get("/partners/:id/rating", v.idParam, asyncHandler(c.getPartnerRating));
router.get("/:id/tracking", v.idParam, asyncHandler(c.getTracking));
router.put("/:id/cancel", requireRole("customer"), v.idParam, asyncHandler(c.cancelOrder));
router.post("/:id/rating", requireRole("customer"), v.rate, asyncHandler(c.rateOrder));
router.put("/:id/status", requireRole("delivery"), v.updateStatus, asyncHandler(c.updateOrderStatus));

module.exports = router;
