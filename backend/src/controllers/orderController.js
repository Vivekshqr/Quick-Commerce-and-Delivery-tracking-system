const mongoose = require("mongoose");
const Order = require("../models/Order");
require("../models/User"); // registered so populate() works
const { emitOrderUpdate } = require("../socket");
const { reserveStock } = require("../services/stockService");

const ALLOWED_UPDATES = ["Accepted", "Out for Delivery", "Delivered"];

// POST /api/orders  (customer)
// Body is either a cart checkout { items: [{ productId, quantity }], location }
// or a simple custom order { product, quantity, location }.
async function createOrder(req, res) {
  const { items, product, quantity, location } = req.body || {};
  if (!location || !String(location).trim()) {
    return res.status(400).json({ message: "Delivery location is required" });
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
    status: "Pending",
  });
  emitOrderUpdate(order);
  res.status(201).json(order);
}

// GET /api/orders/pending  (delivery)
// Unassigned pending orders plus this partner's orders that aren't delivered yet.
async function getActiveOrders(req, res) {
  const orders = await Order.find({
    $or: [
      { status: "Pending" },
      { deliveryPartnerId: req.user.userId, status: { $ne: "Delivered" } },
    ],
  }).sort({ _id: -1 });
  res.status(200).json(orders);
}

// GET /api/orders/customer/:id
async function getCustomerOrders(req, res) {
  const { id } = req.params;
  if (req.user.userId !== id) return res.status(403).json({ message: "Forbidden" });

  const orders = await Order.find({ customerId: id })
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
    .sort({ _id: -1 })
    .populate("customerId deliveryPartnerId", "-password");
  res.status(200).json(orders);
}

// PUT /api/orders/:id/status  (delivery)
async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!ALLOWED_UPDATES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.deliveryPartnerId && order.deliveryPartnerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Order is assigned to another delivery partner" });
  }

  order.status = status;
  order.deliveryPartnerId = req.user.userId;
  await order.save();
  emitOrderUpdate(order);
  res.status(200).json(order);
}

module.exports = { createOrder, getActiveOrders, getCustomerOrders, getOrderHistory, updateOrderStatus };
