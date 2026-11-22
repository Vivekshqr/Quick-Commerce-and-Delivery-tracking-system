const router = require("express").Router();
const c = require("../controllers/orderController");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);

router.post("/", requireRole("customer"), asyncHandler(c.createOrder));
router.get("/pending", requireRole("delivery"), asyncHandler(c.getActiveOrders));
router.get("/customer/:id", asyncHandler(c.getCustomerOrders));
router.get("/history/:userId", asyncHandler(c.getOrderHistory));
router.get("/:id/tracking", asyncHandler(c.getTracking));
router.put("/:id/status", requireRole("delivery"), asyncHandler(c.updateOrderStatus));

module.exports = router;
