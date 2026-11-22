const mongoose = require("mongoose");
const { mongoUri } = require("./env");

async function connectDB() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected");
}

module.exports = connectDB;
