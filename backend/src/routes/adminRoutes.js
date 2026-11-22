const router = require("express").Router();
const c = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate, requireRole("admin"));

router.get("/stats", asyncHandler(c.getStats));
router.get("/orders", asyncHandler(c.listOrders));
router.put("/orders/:id/assign", asyncHandler(c.assignPartner));
router.get("/partners", asyncHandler(c.listPartners));
router.post("/products", asyncHandler(c.createProduct));
router.put("/products/:id", asyncHandler(c.updateProduct));
router.delete("/products/:id", asyncHandler(c.deleteProduct));

module.exports = router;
