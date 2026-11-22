const { Server } = require("socket.io");
const { clientUrls } = require("../config/env");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: clientUrls, credentials: true } });
  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
  });
  return io;
}

// Broadcast an order change to every connected client.
function emitOrderUpdate(order) {
  io?.emit("orderUpdate", { orderId: order._id.toString(), status: order.status });
}

module.exports = { initSocket, emitOrderUpdate };
