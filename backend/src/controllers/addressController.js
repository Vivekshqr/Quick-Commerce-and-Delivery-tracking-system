const mongoose = require("mongoose");
const User = require("../models/User");

function parseAddress(body, partial = false) {
  const { label, line, lat, lng, isDefault } = body || {};
  const out = {};
  if (label !== undefined) out.label = String(label).trim().slice(0, 40) || "Home";
  if (line !== undefined) out.line = String(line).trim();
  if (lat !== undefined) out.lat = Number(lat);
  if (lng !== undefined) out.lng = Number(lng);
  if (isDefault !== undefined) out.isDefault = Boolean(isDefault);
  if (!partial && !out.line) return { error: "Address text is required" };
  if (!partial && (out.lat === undefined || out.lng === undefined)) return { error: "Pick the location on the map" };
  if (out.line !== undefined && !out.line) return { error: "Address text is required" };
  if (out.lat !== undefined && !(out.lat >= -90 && out.lat <= 90)) return { error: "Invalid latitude" };
  if (out.lng !== undefined && !(out.lng >= -180 && out.lng <= 180)) return { error: "Invalid longitude" };
  return { data: out };
}

const loadUser = (id) => User.findById(id);

// GET /api/addresses
async function listAddresses(req, res) {
  const user = await loadUser(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.addresses);
}

// POST /api/addresses
async function addAddress(req, res) {
  const { data, error } = parseAddress(req.body);
  if (error) return res.status(400).json({ message: error });
  const user = await loadUser(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.addresses.length >= 10) return res.status(400).json({ message: "You can save up to 10 addresses" });
  if (data.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => (a.isDefault = false));
    data.isDefault = true;
  }
  user.addresses.push(data);
  await user.save();
  res.status(201).json(user.addresses[user.addresses.length - 1]);
}

// PUT /api/addresses/:id
async function updateAddress(req, res) {
  const { data, error } = parseAddress(req.body, true);
  if (error) return res.status(400).json({ message: error });
  const user = await loadUser(req.user.userId);
  const address = mongoose.isValidObjectId(req.params.id) && user?.addresses.id(req.params.id);
  if (!address) return res.status(404).json({ message: "Address not found" });
  if (data.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(address, data);
  await user.save();
  res.json(address);
}

// DELETE /api/addresses/:id
async function removeAddress(req, res) {
  const user = await loadUser(req.user.userId);
  const address = mongoose.isValidObjectId(req.params.id) && user?.addresses.id(req.params.id);
  if (!address) return res.status(404).json({ message: "Address not found" });
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  res.json({ message: "Address removed" });
}

module.exports = { listAddresses, addAddress, updateAddress, removeAddress };
