import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product: String,
  quantity: Number,
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Out for Delivery", "Delivered"],
    default: "Pending",
  },
  location: String,
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);