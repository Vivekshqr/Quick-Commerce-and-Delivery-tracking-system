const router = require("express").Router();
const c = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const v = require("../middleware/validators");

router.use(authenticate, requireRole("admin"));

router.get("/stats", asyncHandler(c.getStats));
router.get("/orders", asyncHandler(c.listOrders));
router.put("/orders/:id/assign", v.assign, asyncHandler(c.assignPartner));
router.get("/partners", asyncHandler(c.listPartners));
router.post("/products", v.product(false), asyncHandler(c.createProduct));
router.put("/products/:id", v.product(true), asyncHandler(c.updateProduct));
router.delete("/products/:id", v.idParam, asyncHandler(c.deleteProduct));

module.exports = router;
