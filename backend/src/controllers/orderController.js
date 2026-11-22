const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const { emitOrderUpdate, emitToOrder } = require("../socket");
const crypto = require("crypto");
const { reserveStock, restoreStock } = require("../services/stockService");
const { notifyNewOrder, notifyStatusChange, notifyRole, notifyUser } = require("../services/notify");

const newOtp = () => String(crypto.randomInt(0, 10000)).padStart(4, "0");
const hasRating = (o) => o.rating && o.rating.stars != null;

const ALLOWED_UPDATES = ["Accepted", "Out for Delivery", "Delivered"];

// POST /api/orders  (customer)
// Body is either a cart checkout { items: [{ productId, quantity }], location }
// or a simple custom order { product, quantity, location }.
async function createOrder(req, res) {
  const { items, product, quantity, addressId } = req.body || {};
  let { location, locationCoords } = req.body || {};

  // A saved address (picked on the map) fills in the text and the coordinates.
  if (addressId) {
    const user = await User.findById(req.user.userId);
    const address = mongoose.isValidObjectId(addressId) && user?.addresses.id(addressId);
    if (!address) return res.status(400).json({ message: "Saved address not found" });
    location = `${address.label}: ${address.line}`;
    locationCoords = { lat: address.lat, lng: address.lng };
  }
  if (!location || !String(location).trim()) {
    return res.status(400).json({ message: "Delivery location is required" });
  }
  if (locationCoords) {
    const lat = Number(locationCoords.lat), lng = Number(locationCoords.lng);
    locationCoords = lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? { lat, lng } : undefined;
  }

  let orderData;
  if (Array.isArray(items) && items.length > 0) {
    // Merge duplicate lines and validate.
    const merged = new Map();
    for (const it of items) {
      const qty = Number(it?.quantity);
      if (!mongoose.isValidObjectId(it?.productId) || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: "Each item needs a valid productId and quantity >= 1" });
      }
      merged.set(String(it.productId), (merged.get(String(it.productId)) || 0) + qty);
    }
    const reserved = await reserveStock([...merged].map(([productId, q]) => ({ productId, quantity: q })));
    const orderItems = reserved.map(({ product: p, quantity: q }) => ({
      productId: p._id,
      name: p.name,
      imageUrl: p.imageUrl,
      price: p.price,
      quantity: q,
    }));
    const total = Math.round(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
    orderData = {
      items: orderItems,
      total,
      product: orderItems.map((i) => `${i.name} ×${i.quantity}`).join(", "),
      quantity: orderItems.reduce((n, i) => n + i.quantity, 0),
    };
  } else {
    if (!product || !(Number(quantity) >= 1)) {
      return res.status(400).json({ message: "Add items to your cart (or give product and quantity >= 1)" });
    }
    orderData = { product, quantity: Number(quantity) };
  }

  const order = await Order.create({
    ...orderData,
    customerId: req.user.userId,
    location,
    locationCoords,
    status: "Pending",
    deliveryOtp: newOtp(),
  });
  emitOrderUpdate(order);
  notifyNewOrder(order);
  res.status(201).json(order); // the customer sees their OTP
}

// GET /api/orders/pending  (delivery)
// Unassigned pending orders plus this partner's orders that aren't delivered yet.
async function getActiveOrders(req, res) {
  const orders = await Order.find({
    $or: [
      { status: "Pending" },
      { deliveryPartnerId: req.user.userId, status: { $nin: ["Delivered", "Cancelled"] } },
    ],
  }).sort({ _id: -1 });
  res.status(200).json(orders);
}

// GET /api/orders/customer/:id
async function getCustomerOrders(req, res) {
  const { id } = req.params;
  if (req.user.userId !== id) return res.status(403).json({ message: "Forbidden" });

  const orders = await Order.find({ customerId: id })
    .select("+deliveryOtp")
    .sort({ _id: -1 })
    .populate("deliveryPartnerId", "-password");
  res.status(200).json(orders);
}

// GET /api/orders/history/:userId
async function getOrderHistory(req, res) {
  const { userId } = req.params;
  if (req.user.userId !== userId) return res.status(403).json({ message: "Forbidden" });

  const orders = await Order.find({
    $or: [{ customerId: userId }, { deliveryPartnerId: userId }],
  })
    .select("+deliveryOtp")
    .sort({ _id: -1 })
    .populate("customerId deliveryPartnerId", "-password");
  // Only the customer may see the delivery OTP.
  const out = orders.map((o) => {
    const json = o.toJSON();
    if (String(o.customerId?._id) !== userId || ["Delivered", "Cancelled"].includes(o.status)) delete json.deliveryOtp;
    return json;
  });
  res.status(200).json(out);
}

// PUT /api/orders/:id/status  (delivery)
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status, otp } = req.body || {};
  if (!ALLOWED_UPDATES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = await Order.findById(id).select("+deliveryOtp");
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.deliveryPartnerId && order.deliveryPartnerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Order is assigned to another delivery partner" });
  }
  if (["Delivered", "Cancelled"].includes(order.status)) {
    return res.status(400).json({ message: `Order is already ${order.status.toLowerCase()}` });
  }
  if (status === "Delivered") {
    // Orders created before OTPs existed have none; those don't need one.
    if (order.deliveryOtp && String(otp || "").trim() !== order.deliveryOtp) {
      return res.status(400).json({ message: "Incorrect delivery OTP. Ask the customer for the 4-digit code." });
    }
    order.deliveredAt = new Date();
  }

  order.status = status;
  order.deliveryPartnerId = req.user.userId;
  await order.save();
  order.deliveryOtp = undefined; // never send the OTP to the partner
  emitOrderUpdate(order);
  emitToOrder(order._id.toString(), "order:status", { orderId: order._id.toString(), status: order.status });
  notifyStatusChange(order);
  res.status(200).json(order);
}

// GET /api/orders/:id/tracking  (the order's customer or delivery partner)
async function getTracking(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Order not found" });
  const order = await Order.findById(id).select("+deliveryOtp").populate("deliveryPartnerId", "name").populate("customerId", "name");
  if (!order) return res.status(404).json({ message: "Order not found" });
  const uid = req.user.userId;
  const isCustomer = String(order.customerId?._id) === uid;
  const isPartner = order.deliveryPartnerId && String(order.deliveryPartnerId._id) === uid;
  if (!isCustomer && !isPartner) return res.status(403).json({ message: "Forbidden" });
  res.json({
    orderId: order._id,
    status: order.status,
    product: order.product,
    items: order.items,
    total: order.total,
    location: order.location,
    destination: order.locationCoords?.lat != null ? order.locationCoords : null,
    partnerLocation: order.partnerLocation?.lat != null ? order.partnerLocation : null,
    partnerName: order.deliveryPartnerId?.name || null,
    partnerId: order.deliveryPartnerId?._id || null,
    customerName: order.customerId?.name || null,
    // Only the customer sees the OTP, and only while the order is still on its way.
    deliveryOtp: isCustomer && !["Delivered", "Cancelled"].includes(order.status) ? order.deliveryOtp || null : undefined,
    rating: hasRating(order) ? order.rating : null,
  });
}

// PUT /api/orders/:id/cancel  (customer, only while Pending) — puts stock back
async function cancelOrder(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Order not found" });
  // Atomic: only flips Pending -> Cancelled once, so stock is restored once.
  const order = await Order.findOneAndUpdate(
    { _id: id, customerId: req.user.userId, status: "Pending" },
    { status: "Cancelled", cancelledAt: new Date() },
    { new: true }
  );
  if (!order) {
    const existing = await Order.findById(id);
    if (!existing || String(existing.customerId) !== req.user.userId) return res.status(404).json({ message: "Order not found" });
    return res.status(400).json({ message: `Only pending orders can be cancelled (this one is ${existing.status})` });
  }
  if (order.items?.length) await restoreStock(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
  emitOrderUpdate(order);
  const payload = {
    type: "cancelled",
    title: `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled`,
    message: "The customer cancelled this order.",
    orderId: order._id.toString(),
    status: "Cancelled",
  };
  notifyRole("delivery", { ...payload, link: "/delivery" });
  notifyRole("admin", { ...payload, link: "/admin?tab=orders" });
  res.json(order);
}

// POST /api/orders/:id/rating  (customer, once, after delivery) { stars: 1-5, review? }
async function rateOrder(req, res) {
  const { id } = req.params;
  const stars = Number(req.body?.stars);
  const review = String(req.body?.review || "").trim().slice(0, 500);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return res.status(400).json({ message: "Rating must be 1 to 5 stars" });
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Order not found" });
  const order = await Order.findById(id);
  if (!order || String(order.customerId) !== req.user.userId) return res.status(404).json({ message: "Order not found" });
  if (order.status !== "Delivered") return res.status(400).json({ message: "You can rate an order after it is delivered" });
  if (hasRating(order)) return res.status(400).json({ message: "You already rated this order" });
  order.rating = { stars, review, createdAt: new Date() };
  await order.save();
  notifyUser(order.deliveryPartnerId, {
    type: "rating",
    title: `You got ${"★".repeat(stars)}`,
    message: review ? `“${review.slice(0, 80)}”` : `Order #${order._id.toString().slice(-6).toUpperCase()} was rated ${stars}/5.`,
    orderId: order._id.toString(),
    link: "/delivery",
  });
  res.status(201).json(order);
}

// GET /api/orders/partners/:id/rating  — average rating and recent reviews of a delivery partner
async function getPartnerRating(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Partner not found" });
  const pid = new mongoose.Types.ObjectId(id);
  const [agg] = await Order.aggregate([
    { $match: { deliveryPartnerId: pid, "rating.stars": { $gte: 1 } } },
    { $group: { _id: null, average: { $avg: "$rating.stars" }, count: { $sum: 1 } } },
  ]);
  const recent = await Order.find({ deliveryPartnerId: pid, "rating.stars": { $gte: 1 } })
    .sort({ "rating.createdAt": -1 })
    .limit(5)
    .populate("customerId", "name")
    .select("rating customerId");
  res.json({
    average: agg ? Math.round(agg.average * 10) / 10 : null,
    count: agg?.count || 0,
    recent: recent.map((o) => ({ stars: o.rating.stars, review: o.rating.review, createdAt: o.rating.createdAt, customer: o.customerId?.name })),
  });
}

module.exports = { cancelOrder, rateOrder, getPartnerRating, getTracking, createOrder, getActiveOrders, getCustomerOrders, getOrderHistory, updateOrderStatus };
