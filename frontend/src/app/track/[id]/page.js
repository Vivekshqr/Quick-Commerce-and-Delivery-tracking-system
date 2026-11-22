"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { errorMessage, hasSession, ordersApi } from "@/lib/api";
import useSocket from "@/lib/useSocket";
import PageHeader from "@/components/PageHeader";
import TrackingStats from "@/components/TrackingStats";
import { TrackingMap } from "@/components/map";
import { Alert, LoadingState, StatusBadge } from "@/components/ui";

const STEPS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const socket = useSocket();
  const [info, setInfo] = useState(null);
  const [rider, setRider] = useState(null);
  const [trail, setTrail] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasSession()) {
      router.push("/login");
      return;
    }
    ordersApi
      .tracking(id)
      .then((data) => {
        setInfo(data);
        if (data.partnerLocation) {
          setRider(data.partnerLocation);
          setTrail([data.partnerLocation]);
        }
      })
      .catch((err) => setError(errorMessage(err, "Could not load this order")));
  }, [id, router]);

  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit("order:watch", { orderId: id });
    const onLocation = (p) => {
      if (p.orderId !== id) return;
      setRider(p);
      setTrail((t) => [...t.slice(-200), p]);
    };
    const onStatus = ({ orderId, status }) => orderId === id && setInfo((i) => (i ? { ...i, status } : i));
    socket.on("connect", join);
    if (socket.connected) join();
    socket.on("order:location", onLocation);
    socket.on("orderUpdate", onStatus);
    return () => {
      socket.emit("order:unwatch", { orderId: id });
      socket.off("connect", join);
      socket.off("order:location", onLocation);
      socket.off("orderUpdate", onStatus);
    };
  }, [socket, id]);

  if (error) return <Alert>{error}</Alert>;
  if (!info) return <LoadingState label="Loading tracking…" />;

  const step = STEPS.indexOf(info.status);
  const live = info.status === "Out for Delivery";

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Live tracking" title="Track your order" subtitle={`Order #${String(info.orderId).slice(-6).toUpperCase()} · ${info.location}`}
        actionHref="/customer" actionLabel="← My orders" />

      <section className="card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={info.status} />
            {live && rider && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                Live
              </span>
            )}
          </div>
          {info.partnerName && <p className="text-sm text-slate-600">Delivery partner: <b className="text-slate-900">{info.partnerName}</b></p>}
        </div>

        <ol className="relative grid grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-4 h-1 rounded-full bg-slate-200" />
          <div className="absolute left-[12.5%] top-4 h-1 rounded-full bg-brand-500 transition-all duration-700"
            style={{ width: `${Math.max(0, step) * 25}%` }} />
          {STEPS.map((s, i) => (
            <li key={s} className="relative flex flex-col items-center gap-1.5 text-center">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-4 ring-surface transition ${
                i < step ? "bg-brand-600 text-white" : i === step ? "bg-brand-600 text-white shadow-lg shadow-brand-600/40 animate-pop" : "bg-slate-200 text-slate-500"}`}>
                {i < step ? "✓" : ["🧾", "👍", "🛵", "🏠"][i]}
              </span>
              <span className={`text-[11px] sm:text-xs ${i <= step ? "font-bold text-slate-900" : "text-slate-500"}`}>{s}</span>
            </li>
          ))}
        </ol>

        {info.deliveryOtp && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 px-4 py-3">
            <span className="text-sm text-brand-800"><b className="block text-brand-900">Delivery OTP</b>Give this code to the partner at your door</span>
            <span className="rounded-xl bg-surface px-4 py-2 font-mono text-2xl font-black tracking-[0.3em] text-brand-900 shadow-sm">{info.deliveryOtp}</span>
          </div>
        )}
        {info.status === "Cancelled" && <Alert>This order was cancelled.</Alert>}

        {live || rider ? (
          <TrackingStats rider={rider} destination={info.destination} updatedAt={rider?.updatedAt} />
        ) : null}

        {info.status === "Delivered" ? (
          <Alert type="success">Your order has been delivered. Enjoy! You can rate the delivery from “My orders”.</Alert>
        ) : info.status === "Cancelled" ? null : !live ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Live tracking starts when your order is <b>Out for Delivery</b>.
          </p>
        ) : !rider ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Waiting for the delivery partner&apos;s location…</p>
        ) : null}

        {info.destination || rider ? (
          <div className="overflow-hidden rounded-2xl border border-line shadow-card">
            <TrackingMap destination={info.destination} rider={rider} trail={trail} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">This order has no map location (it was placed with a typed address).</p>
        )}
      </section>
    </div>
  );
}
