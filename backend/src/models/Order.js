const mongoose = require("mongoose");

const ORDER_STATUSES = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    imageUrl: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Summary fields (kept for simple/custom orders and older orders)
    product: String,
    quantity: Number,
    // Catalogue orders
    items: { type: [OrderItemSchema], default: undefined },
    total: Number,
    status: { type: String, enum: ORDER_STATUSES, default: "Pending" },
    location: String,
    // Map position of the delivery address (when picked on the map)
    locationCoords: {
      lat: Number,
      lng: Number,
    },
    // Last position shared by the delivery partner (live tracking)
    partnerLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
