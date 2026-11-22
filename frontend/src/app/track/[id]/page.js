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
      router.push("/");
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
      <PageHeader title="Track your order" subtitle={`Order #${String(info.orderId).slice(-6).toUpperCase()} · ${info.location}`}
        actionHref="/customer" actionLabel="← My orders" />

      <section className="card space-y-5">
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

        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`mx-auto mb-1 h-2 rounded-full ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`} />
              <span className={`text-[11px] sm:text-xs ${i <= step ? "font-semibold text-slate-900" : "text-slate-400"}`}>{s}</span>
            </li>
          ))}
        </ol>

        {info.deliveryOtp && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50 px-4 py-3">
            <span className="text-sm text-indigo-800">Delivery OTP: give this code to the partner at your door</span>
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-indigo-900">{info.deliveryOtp}</span>
          </div>
        )}
        {info.status === "Cancelled" && <Alert>This order was cancelled.</Alert>}

        {live || rider ? (
          <TrackingStats rider={rider} destination={info.destination} updatedAt={rider?.updatedAt} />
        ) : null}

        {info.status === "Delivered" ? (
          <Alert type="success">Your order has been delivered. Enjoy! You can rate the delivery from “My orders”.</Alert>
        ) : info.status === "Cancelled" ? null : !live ? (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Live tracking starts when your order is <b>Out for Delivery</b>.
          </p>
        ) : !rider ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Waiting for the delivery partner&apos;s location…</p>
        ) : null}

        {info.destination || rider ? (
          <TrackingMap destination={info.destination} rider={rider} trail={trail} />
        ) : (
          <p className="text-sm text-slate-500">This order has no map location (it was placed with a typed address).</p>
        )}
      </section>
    </div>
  );
}
