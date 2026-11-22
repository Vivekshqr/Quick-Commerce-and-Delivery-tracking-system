const http = require("http");
const { port } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocket } = require("./socket");

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }

  const server = http.createServer(app);
  initSocket(server);

  server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
  server.listen(port, () => console.log(`API server running on http://localhost:${port}`));
}

start();
