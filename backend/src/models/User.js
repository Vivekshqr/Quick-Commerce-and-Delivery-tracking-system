const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: "Home", trim: true }, // Home, Work, ...
  line: { type: String, required: true, trim: true }, // full address text
  lat: { type: Number, required: true, min: -90, max: 90 },
  lng: { type: Number, required: true, min: -180, max: 180 },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["customer", "delivery", "admin"], required: true },
  addresses: { type: [AddressSchema], default: [] },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
