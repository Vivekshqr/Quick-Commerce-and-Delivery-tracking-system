const router = require("express").Router();
const c = require("../controllers/orderController");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router.post("/", requireRole("customer"), asyncHandler(c.createOrder));
router.get("/pending", requireRole("delivery"), asyncHandler(c.getActiveOrders));
router.get("/customer/:id", asyncHandler(c.getCustomerOrders));
router.get("/history/:userId", asyncHandler(c.getOrderHistory));
router.get("/partners/:id/rating", asyncHandler(c.getPartnerRating));
router.get("/:id/tracking", asyncHandler(c.getTracking));
router.put("/:id/cancel", requireRole("customer"), asyncHandler(c.cancelOrder));
router.post("/:id/rating", requireRole("customer"), asyncHandler(c.rateOrder));
router.put("/:id/status", requireRole("delivery"), asyncHandler(c.updateOrderStatus));

module.exports = router;
