const router = require("express").Router();
const c = require("../controllers/addressController");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(authenticate);
router.get("/", asyncHandler(c.listAddresses));
router.post("/", asyncHandler(c.addAddress));
router.put("/:id", asyncHandler(c.updateAddress));
router.delete("/:id", asyncHandler(c.removeAddress));

module.exports = router;
