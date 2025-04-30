"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import useSocket from "../../lib/useSocket";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [userId, setUserId] = useState(null);
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const userResponse = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(userResponse.data._id);
        const ordersResponse = await axios.get(
          `/api/orders/customer/${userResponse.data._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(ordersResponse.data);
      } catch (error) {
        router.push("/");
      }
    };
    fetchUserAndOrders();
  }, [router]);

  useEffect(() => {
    if (socket) {
      socket.on("orderUpdate", ({ orderId, status }) => {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
      });
    }
  }, [socket]);

  const handleOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "/api/orders",
        { product, quantity, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axios.get(`/api/orders/customer/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
      setProduct("");
      setQuantity(1);
      setLocation("");
    } catch (error) {
      console.error("Order placement failed:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <form onSubmit={handleOrder}>
        <h2 className="text-xl font-semibold mb-2">Place Order</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Product ID</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Product ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Delivery Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Delivery Location"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Place Order
          </button>
        </div>
      </form>
      <h2 className="text-xl font-semibold mt-6 mb-2">Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order._id} className="p-4 bg-gray-50 rounded">
              <p>
                <strong>Product:</strong> {order.product}
              </p>
              <p>
                <strong>Quantity:</strong> {order.quantity}
              </p>
              <p>
                <strong>Location:</strong> {order.location}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
            </li>
          ))}
        </ul>
      )}
      <a
        href="/history"
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        View Order History
      </a>
    </div>
  );
}
