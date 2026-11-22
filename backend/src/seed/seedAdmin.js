// Creates an admin account (if none exists) and writes its login to backend/admin-credentials.txt.
// Usage: npm run seed:admin
require("../config/env");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const FILE = path.join(__dirname, "..", "..", "admin-credentials.txt");

(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || "admin@quickcart.local").toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin ${email} already exists. Credentials file: ${FILE}`);
  } else {
    const password = crypto.randomBytes(9).toString("base64url");
    await User.create({ name: "Admin", email, password: await bcrypt.hash(password, 10), role: "admin" });
    fs.writeFileSync(
      FILE,
      `QuickCart admin login (created ${new Date().toISOString()})\nEmail: ${email}\nPassword: ${password}\n\nChange or delete this file after noting the password.\n`
    );
    console.log(`Admin account created. Credentials written to ${FILE}`);
  }
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
