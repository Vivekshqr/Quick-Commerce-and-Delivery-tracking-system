const router = require("express").Router();
const c = require("../controllers/productController");
const { asyncHandler } = require("../middleware/errorHandler");
const v = require("../middleware/validators");

router.get("/", v.productQuery, asyncHandler(c.listProducts));
router.get("/categories", asyncHandler(c.listCategories));
router.get("/:id", asyncHandler(c.getProduct));

module.exports = router;
