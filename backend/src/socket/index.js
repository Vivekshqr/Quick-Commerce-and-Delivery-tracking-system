const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { clientUrls, jwtSecret } = require("../config/env");
const registerTrackingHandlers = require("./trackingHandlers");
const { readTokenFromCookieHeader } = require("../services/authCookie");
const notify = require("../services/notify");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: clientUrls, credentials: true } });

  // Optional auth: sockets with a valid token can join order rooms and share location.
  io.use((socket, next) => {
    // Browser: httpOnly cookie sent with the handshake. Other clients may pass auth.token.
    const token = readTokenFromCookieHeader(socket.handshake.headers.cookie) || socket.handshake.auth?.token;
    if (token) {
      try {
        socket.data.user = jwt.verify(token, jwtSecret);
      } catch {
        /* anonymous socket: only receives public orderUpdate broadcasts */
      }
    }
    next();
  });

  notify.setIO(io);

  io.on("connection", (socket) => {
    console.log("New client connected");
    const user = socket.data.user;
    if (user) {
      socket.join(notify.userRoom(user.userId));
      socket.join(notify.roleRoom(user.role));
    }
    registerTrackingHandlers(io, socket);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });
  return io;
}

const orderRoom = (orderId) => `order:${orderId}`;

// Broadcast an order change to every connected client (and the order's room).
function emitOrderUpdate(order) {
  const payload = { orderId: order._id.toString(), status: order.status };
  io?.emit("orderUpdate", payload);
}

function emitToOrder(orderId, event, payload) {
  io?.to(orderRoom(orderId)).emit(event, payload);
}

module.exports = { initSocket, emitOrderUpdate, emitToOrder, orderRoom };
