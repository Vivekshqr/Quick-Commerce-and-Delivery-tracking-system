// Seeds the product catalogue. Usage: npm run seed  (add --reset to replace existing products)
require("../config/env");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const products = require("./products");

(async () => {
  await connectDB();
  const reset = process.argv.includes("--reset");
  if (reset) await Product.deleteMany({});
  let added = 0;
  for (const p of products) {
    const res = await Product.updateOne({ name: p.name }, { $setOnInsert: p }, { upsert: true });
    if (res.upsertedCount) added += 1;
  }
  console.log(`Products: ${added} added, ${products.length - added} already existed.`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
