// In-app notifications pushed over Socket.IO to a user's or a role's room.
// Payload: { type, title, message, orderId?, status?, link? }
let ioRef = null;
const setIO = (io) => (ioRef = io);

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;

function send(room, payload) {
  ioRef?.to(room).emit("notification", { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), ...payload });
}

const notifyUser = (userId, payload) => userId && send(userRoom(String(userId)), payload);
const notifyRole = (role, payload) => send(roleRoom(role), payload);

const shortId = (order) => `#${order._id.toString().slice(-6).toUpperCase()}`;

const STATUS_TEXT = {
  Accepted: "has been accepted by a delivery partner",
  "Out for Delivery": "is out for delivery 🛵",
  Delivered: "has been delivered ✅",
  Cancelled: "was cancelled",
};

// Tell the customer their order status changed.
function notifyStatusChange(order) {
  notifyUser(order.customerId?._id || order.customerId, {
    type: "status",
    title: `Order ${shortId(order)}: ${order.status}`,
    message: `Your order ${STATUS_TEXT[order.status] || `is now ${order.status}`}.`,
    orderId: order._id.toString(),
    status: order.status,
    link: ["Accepted", "Out for Delivery"].includes(order.status) ? `/track/${order._id}` : "/customer",
  });
  notifyRole("admin", {
    type: "status",
    title: `Order ${shortId(order)}: ${order.status}`,
    message: `Status changed to ${order.status}.`,
    orderId: order._id.toString(),
    status: order.status,
    link: "/admin?tab=orders",
  });
}

function notifyNewOrder(order) {
  const payload = {
    type: "new-order",
    title: `New order ${shortId(order)}`,
    message: `${order.product} → ${order.location}`,
    orderId: order._id.toString(),
    status: order.status,
  };
  notifyRole("delivery", { ...payload, link: "/delivery" });
  notifyRole("admin", { ...payload, link: "/admin?tab=orders" });
}

function notifyAssigned(order) {
  notifyUser(order.deliveryPartnerId?._id || order.deliveryPartnerId, {
    type: "assigned",
    title: `Order ${shortId(order)} assigned to you`,
    message: `Deliver to ${order.location}.`,
    orderId: order._id.toString(),
    status: order.status,
    link: `/delivery/${order._id}`,
  });
}

module.exports = { setIO, userRoom, roleRoom, notifyUser, notifyRole, notifyStatusChange, notifyNewOrder, notifyAssigned };
