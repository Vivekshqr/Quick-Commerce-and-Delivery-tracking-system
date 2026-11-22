const mongoose = require("mongoose");
const Order = require("../models/Order");

const orderRoom = (orderId) => `order:${orderId}`;

const canView = (order, user) =>
  user &&
  (String(order.customerId) === user.userId ||
    (order.deliveryPartnerId && String(order.deliveryPartnerId) === user.userId));

// Live tracking over Socket.IO:
//  client -> "order:watch"     { orderId }            join the order's room (customer or its partner)
//  client -> "order:unwatch"   { orderId }
//  partner -> "location:update" { orderId, lat, lng }  only while the order is "Out for Delivery"
//  server -> "order:location"  { orderId, lat, lng, updatedAt }
module.exports = function registerTrackingHandlers(io, socket) {
  socket.on("order:watch", async ({ orderId } = {}, ack) => {
    try {
      const user = socket.data.user;
      if (!user || !mongoose.isValidObjectId(orderId)) return ack?.({ ok: false, message: "Unauthorized" });
      const order = await Order.findById(orderId);
      if (!order || !canView(order, user)) return ack?.({ ok: false, message: "Not allowed" });
      socket.join(orderRoom(orderId));
      ack?.({ ok: true, partnerLocation: order.partnerLocation?.lat != null ? order.partnerLocation : null });
    } catch (err) {
      console.error(err);
      ack?.({ ok: false, message: "Server error" });
    }
  });

  socket.on("order:unwatch", ({ orderId } = {}) => socket.leave(orderRoom(orderId)));

  socket.on("location:update", async ({ orderId, lat, lng } = {}, ack) => {
    try {
      const user = socket.data.user;
      lat = Number(lat);
      lng = Number(lng);
      if (!user || user.role !== "delivery") return ack?.({ ok: false, message: "Unauthorized" });
      if (!mongoose.isValidObjectId(orderId) || !(lat >= -90 && lat <= 90) || !(lng >= -180 && lng <= 180)) {
        return ack?.({ ok: false, message: "Invalid location" });
      }
      const updatedAt = new Date();
      const order = await Order.findOneAndUpdate(
        { _id: orderId, deliveryPartnerId: user.userId, status: "Out for Delivery" },
        { partnerLocation: { lat, lng, updatedAt } },
        { new: true }
      );
      if (!order) return ack?.({ ok: false, message: "Order is not out for delivery with you" });
      io.to(orderRoom(orderId)).emit("order:location", { orderId, lat, lng, updatedAt });
      ack?.({ ok: true });
    } catch (err) {
      console.error(err);
      ack?.({ ok: false, message: "Server error" });
    }
  });
};
