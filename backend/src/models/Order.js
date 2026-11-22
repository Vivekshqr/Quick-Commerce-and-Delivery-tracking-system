const mongoose = require("mongoose");

const ORDER_STATUSES = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product: String,
  quantity: Number,
  status: { type: String, enum: ORDER_STATUSES, default: "Pending" },
  location: String,
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
