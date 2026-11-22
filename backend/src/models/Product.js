const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "" }, // e.g. "1 L", "500 g"
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", category: "text" });

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);
