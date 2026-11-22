const { body, param, query, validationResult } = require("express-validator");

// Runs the rules and returns 400 { message, errors } on the first problem.
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
    res.status(400).json({ message: errors[0].message, errors });
  },
];

const objectId = (field, where = param) => where(field).isMongoId().withMessage(`Invalid ${field}`);
const email = () => body("email").trim().isEmail().withMessage("Enter a valid email address").toLowerCase();
const newPassword = (field = "password") =>
  body(field).isString().isLength({ min: 6, max: 128 }).withMessage("Password must be at least 6 characters");

module.exports = {
  register: validate([
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
    email(),
    newPassword(),
    body("role").isIn(["customer", "delivery"]).withMessage("Role must be customer or delivery"),
  ]),
  login: validate([email(), body("password").isString().notEmpty().withMessage("Password is required")]),
  forgotPassword: validate([email()]),
  resetPassword: validate([body("token").isString().isLength({ min: 20 }).withMessage("Invalid or expired reset link"), newPassword()]),

  createOrder: validate([
    body("items").optional().isArray({ min: 1, max: 50 }).withMessage("Cart must have 1–50 items"),
    body("items.*.productId").optional().isMongoId().withMessage("Invalid product in cart"),
    body("items.*.quantity").optional().isInt({ min: 1, max: 100 }).withMessage("Quantity must be 1–100").toInt(),
    body("addressId").optional().isMongoId().withMessage("Invalid saved address"),
    body("location").optional().isString().trim().isLength({ max: 300 }).withMessage("Location is too long"),
    body("product").optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage("Item must be 1–200 characters"),
    body("quantity").optional().isInt({ min: 1, max: 100 }).withMessage("Quantity must be 1–100").toInt(),
  ]),
  orderId: validate([objectId("id")]),
  userIdParam: validate([objectId("userId")]),
  idParam: validate([objectId("id")]),
  updateStatus: validate([
    objectId("id"),
    body("status").isIn(["Accepted", "Out for Delivery", "Delivered"]).withMessage("Invalid status"),
    body("otp").optional({ values: "falsy" }).isString().trim().matches(/^\d{4}$/).withMessage("OTP must be 4 digits"),
  ]),
  rate: validate([
    objectId("id"),
    body("stars").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1 to 5 stars").toInt(),
    body("review").optional().isString().trim().isLength({ max: 500 }).withMessage("Review is too long (max 500)"),
  ]),
  address: (partial = false) =>
    validate([
      ...(partial ? [objectId("id")] : []),
      body("label").optional().isString().trim().isLength({ max: 40 }).withMessage("Label is too long"),
      (partial ? body("line").optional() : body("line")).isString().trim().isLength({ min: 3, max: 300 }).withMessage("Address must be 3–300 characters"),
      (partial ? body("lat").optional() : body("lat")).isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude").toFloat(),
      (partial ? body("lng").optional() : body("lng")).isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude").toFloat(),
      body("isDefault").optional().isBoolean().withMessage("isDefault must be true/false").toBoolean(),
    ]),
  product: (partial = false) =>
    validate([
      ...(partial ? [objectId("id")] : []),
      (partial ? body("name").optional() : body("name")).isString().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),
      (partial ? body("category").optional() : body("category")).isString().trim().isLength({ min: 2, max: 40 }).withMessage("Category must be 2–40 characters"),
      (partial ? body("price").optional() : body("price")).isFloat({ min: 0, max: 100000 }).withMessage("Price must be between 0 and 100000").toFloat(),
      body("stock").optional().isInt({ min: 0, max: 100000 }).withMessage("Stock must be a whole number, 0 or more").toInt(),
      body("unit").optional().isString().trim().isLength({ max: 30 }),
      body("description").optional().isString().trim().isLength({ max: 500 }),
      body("imageUrl").optional({ values: "falsy" }).isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("Image URL must start with http:// or https://"),
    ]),
  assign: validate([objectId("id"), body("partnerId").isMongoId().withMessage("Choose a delivery partner")]),
  productQuery: validate([
    query("q").optional().isString().trim().isLength({ max: 60 }),
    query("category").optional().isString().trim().isLength({ max: 40 }),
  ]),
};
