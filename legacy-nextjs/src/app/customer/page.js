"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import useSocket from "@/lib/useSocket";
import { useRouter } from "next/navigation";
import { Alert, EmptyState, LoadingState, OrderCard, Spinner } from "@/components/ui";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        if (userResponse.data.role !== "customer") {
          router.push("/delivery");
          return;
        }
        setUserId(userResponse.data._id);
        const ordersResponse = await axios.get(`/api/orders/customer/${userResponse.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersResponse.data);
        setLoading(false);
      } catch {
        router.push("/");
      }
    };
    fetchUserAndOrders();
  }, [router]);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = ({ orderId, status }) => {
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)));
    };
    socket.on("orderUpdate", onOrderUpdate);
    return () => socket.off("orderUpdate", onOrderUpdate);
  }, [socket]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
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
      setSuccess("Order placed! A delivery partner will pick it up soon.");
    } catch (error) {
      console.error("Order placement failed:", error);
      setError(error.response?.data?.message || "Order placement failed");
    } finally {
      setSubmitting(false);
    }
  };

  const active = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Customer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Place new orders and track them live.</p>
        </div>
        <Link href="/history" className="btn-secondary">View order history</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Place an order</h2>
          <p className="mb-4 text-sm text-slate-500">Fill in the details below.</p>
          <Alert onClose={() => setError("")}>{error}</Alert>
          <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label htmlFor="product" className="label">Product ID</label>
              <input id="product" type="text" value={product} onChange={(e) => setProduct(e.target.value)}
                className="input" placeholder="e.g. MILK-1L" required />
            </div>
            <div>
              <label htmlFor="quantity" className="label">Quantity</label>
              <input id="quantity" type="number" value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))} className="input" min="1" required />
            </div>
            <div>
              <label htmlFor="location" className="label">Delivery location</label>
              <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="input" placeholder="House no., street, area" required />
            </div>
            <button type="submit" disabled={submitting || !userId} className="btn-primary w-full">
              {submitting && <Spinner className="h-4 w-4" />}
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </form>
        </section>

        <section className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your orders</h2>
            {!loading && orders.length > 0 && (
              <span className="text-sm text-slate-500">{active} active · {orders.length} total</span>
            )}
          </div>
          {loading ? (
            <LoadingState label="Loading your orders…" />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Your orders will appear here once you place one." />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
