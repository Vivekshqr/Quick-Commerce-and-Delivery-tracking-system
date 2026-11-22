const router = require("express").Router();
const c = require("../controllers/addressController");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const v = require("../middleware/validators");

router.use(authenticate);
router.get("/", asyncHandler(c.listAddresses));
router.post("/", v.address(false), asyncHandler(c.addAddress));
router.put("/:id", v.address(true), asyncHandler(c.updateAddress));
router.delete("/:id", v.idParam, asyncHandler(c.removeAddress));

module.exports = router;
