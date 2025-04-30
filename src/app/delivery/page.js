"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DeliveryDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const { data } = await axios.get("/api/orders/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingOrders(data);
      } catch (error) {
        router.push("/");
      }
    };
    fetchPendingOrders();
  }, [router]);

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await axios.get("/api/orders/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingOrders(data);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h1 className="text-2xl font-bold mb-4">Delivery Partner Dashboard</h1>
      <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <ul className="space-y-2">
          {pendingOrders.map((order) => (
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
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => updateStatus(order._id, "Accepted")}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(order._id, "Out for Delivery")}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Out for Delivery
                </button>
                <button
                  onClick={() => updateStatus(order._id, "Delivered")}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Delivered
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <a
        href="/history"
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        View Completed Orders
      </a>
    </div>
  );
}