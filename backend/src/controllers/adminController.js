const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { emitOrderUpdate, emitToOrder } = require("../socket");

const PRODUCT_FIELDS = ["name", "description", "imageUrl", "price", "unit", "category", "stock"];

function productInput(body, partial) {
  const data = {};
  for (const f of PRODUCT_FIELDS) if (body?.[f] !== undefined) data[f] = body[f];
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.stock !== undefined) data.stock = Number(data.stock);
  if (!partial && (!data.name || !data.category || data.price === undefined)) {
    return { error: "Name, category and price are required" };
  }
  if (data.price !== undefined && !(data.price >= 0)) return { error: "Price must be 0 or more" };
  if (data.stock !== undefined && !(Number.isInteger(data.stock) && data.stock >= 0)) {
    return { error: "Stock must be a whole number, 0 or more" };
  }
  return { data };
}

// GET /api/admin/stats
async function getStats(req, res) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const [byStatus, revenueAgg, daily, topProducts, customers, partners, products, lowStock] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, revenue: { $sum: { $ifNull: ["$total", 0] } }, orders: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "Cancelled" } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } }, revenue: { $sum: { $ifNull: ["$total", 0] } }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "delivery" }),
    Product.countDocuments(),
    Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(8).select("name stock"),
  ]);

  // Fill the last 7 days, including days without orders.
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const row = daily.find((x) => x._id === key);
    days.push({ date: key, revenue: row?.revenue || 0, orders: row?.orders || 0 });
  }

  res.json({
    totals: {
      orders: revenueAgg[0]?.orders || 0,
      revenue: revenueAgg[0]?.revenue || 0,
      customers,
      partners,
      products,
    },
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    last7Days: days,
    topProducts: topProducts.map((p) => ({ name: p._id, quantity: p.quantity, revenue: p.revenue })),
    lowStock,
  });
}

// GET /api/admin/orders?status=
async function listOrders(req, res) {
  const filter = {};
  if (req.query.status && req.query.status !== "All") filter.status = String(req.query.status);
  const orders = await Order.find(filter)
    .sort({ _id: -1 })
    .limit(200)
    .populate("customerId deliveryPartnerId", "name email role");
  res.json(orders);
}

// GET /api/admin/partners
async function listPartners(req, res) {
  const partners = await User.find({ role: "delivery" }).select("name email").sort({ name: 1 });
  res.json(partners);
}

// PUT /api/admin/orders/:id/assign { partnerId }
async function assignPartner(req, res) {
  const { id } = req.params;
  const { partnerId } = req.body || {};
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Order not found" });
  if (!mongoose.isValidObjectId(partnerId)) return res.status(400).json({ message: "Choose a delivery partner" });
  const partner = await User.findOne({ _id: partnerId, role: "delivery" });
  if (!partner) return res.status(400).json({ message: "Delivery partner not found" });
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (["Delivered", "Cancelled"].includes(order.status)) {
    return res.status(400).json({ message: `Order is already ${order.status.toLowerCase()}` });
  }
  order.deliveryPartnerId = partner._id;
  if (order.status === "Pending") order.status = "Accepted";
  await order.save();
  emitOrderUpdate(order);
  emitToOrder(order._id.toString(), "order:status", { orderId: order._id.toString(), status: order.status });
  await order.populate("customerId deliveryPartnerId", "name email role");
  res.json(order);
}

// POST /api/admin/products
async function createProduct(req, res) {
  const { data, error } = productInput(req.body, false);
  if (error) return res.status(400).json({ message: error });
  const product = await Product.create(data);
  res.status(201).json(product);
}

// PUT /api/admin/products/:id
async function updateProduct(req, res) {
  const { data, error } = productInput(req.body, true);
  if (error) return res.status(400).json({ message: error });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}

// DELETE /api/admin/products/:id
async function deleteProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
}

module.exports = { getStats, listOrders, listPartners, assignPartner, createProduct, updateProduct, deleteProduct };
