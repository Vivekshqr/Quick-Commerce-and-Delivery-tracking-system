const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy backend/.env.example to backend/.env and fill it in.`);
    process.exit(1);
  }
}

module.exports = {
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrls: (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((s) => s.trim()),
};
