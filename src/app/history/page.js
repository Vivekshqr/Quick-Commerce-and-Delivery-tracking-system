"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function OrderHistory() {
  const [history, setHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
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
        const { data } = await axios.get(`/api/orders/history/${userResponse.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(data);
      } catch (error) {
        router.push("/");
      }
    };
    fetchHistory();
  }, [router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {history.length === 0 ? (
        <p>No orders in history.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((order) => (
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
        href={userId && history.some((order) => order.customerId._id === userId) ? "/customer" : "/delivery"}
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        Back to Dashboard
      </a>
    </div>
  );
}