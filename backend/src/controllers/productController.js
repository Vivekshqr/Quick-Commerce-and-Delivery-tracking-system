const mongoose = require("mongoose");
const Product = require("../models/Product");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/products?q=milk&category=Dairy
async function listProducts(req, res) {
  const { q, category } = req.query;
  const filter = {};
  if (q && String(q).trim()) filter.name = { $regex: escapeRegex(String(q).trim()), $options: "i" };
  if (category && category !== "All") filter.category = String(category);
  const products = await Product.find(filter).sort({ category: 1, name: 1 });
  res.json(products);
}

// GET /api/products/categories
async function listCategories(req, res) {
  const categories = await Product.distinct("category");
  res.json(categories.sort());
}

// GET /api/products/:id
async function getProduct(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Product not found" });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}

module.exports = { listProducts, listCategories, getProduct };
