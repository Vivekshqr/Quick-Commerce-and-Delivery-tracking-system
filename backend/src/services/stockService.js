const Product = require("../models/Product");

// Reserve stock for each item; if any item is short, roll back what was taken.
// items: [{ productId, quantity }]. Returns the product docs (after decrement).
async function reserveStock(items) {
  const taken = [];
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        const existing = await Product.findById(item.productId);
        const err = new Error(
          existing ? `Only ${existing.stock} left of ${existing.name}` : "A product in your cart no longer exists"
        );
        err.status = 400;
        throw err;
      }
      taken.push({ product, quantity: item.quantity });
    }
    return taken;
  } catch (err) {
    await restoreStock(taken.map((t) => ({ productId: t.product._id, quantity: t.quantity })));
    throw err;
  }
}

// Put stock back (used for rollbacks and cancellations).
async function restoreStock(items) {
  for (const item of items) {
    if (item.productId) await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
}

module.exports = { reserveStock, restoreStock };
