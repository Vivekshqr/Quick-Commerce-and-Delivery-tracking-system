"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { errorMessage, hasSession, ordersApi } from "@/lib/api";
import { pointNear, simulatedRoute } from "@/lib/geo";
import useSocket from "@/lib/useSocket";
import PageHeader from "@/components/PageHeader";
import TrackingStats from "@/components/TrackingStats";
import { TrackingMap } from "@/components/map";
import { Alert, LoadingState, StatusBadge } from "@/components/ui";
import OtpPrompt from "@/components/OtpPrompt";

// Delivery partner's view of one order: share live GPS or simulate a route for testing.
export default function DeliveryTrackPage() {
  const { id } = useParams();
  const router = useRouter();
  const socket = useSocket();
  const [info, setInfo] = useState(null);
  const [me, setMe] = useState(null);
  const [trail, setTrail] = useState([]);
  const [mode, setMode] = useState(null); // "gps" | "sim" | null
  const [error, setError] = useState("");
  const [askOtp, setAskOtp] = useState(false);
  const watchId = useRef(null);
  const simTimer = useRef(null);

  const load = useCallback(() => ordersApi.tracking(id).then((d) => {
    setInfo(d);
    if (d.partnerLocation) setMe(d.partnerLocation);
  }), [id]);

  useEffect(() => {
    if (!hasSession()) {
      router.push("/");
      return;
    }
    load().catch((err) => setError(errorMessage(err, "Could not load this order")));
  }, [load, router]);

  const send = useCallback((pos) => {
    const p = { ...pos, updatedAt: new Date().toISOString() };
    setMe(p);
    setTrail((t) => [...t.slice(-200), p]);
    socket?.emit("location:update", { orderId: id, lat: pos.lat, lng: pos.lng }, (res) => {
      if (res && !res.ok) setError(res.message);
    });
  }, [socket, id]);

  const stop = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    if (simTimer.current) clearInterval(simTimer.current);
    watchId.current = null;
    simTimer.current = null;
    setMode(null);
  }, []);

  useEffect(() => stop, [stop]);

  const startGps = () => {
    setError("");
    if (!navigator.geolocation) return setError("This browser can't share location. Use Simulate route.");
    stop();
    setMode("gps");
    watchId.current = navigator.geolocation.watchPosition(
      (p) => send({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { setError("Location permission denied or unavailable. Use Simulate route instead."); stop(); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const startSim = () => {
    setError("");
    const dest = info?.destination;
    if (!dest) return setError("This order has no map location to drive to.");
    stop();
    const start = me && Math.abs(me.lat - dest.lat) + Math.abs(me.lng - dest.lng) > 0.002 ? me : pointNear(dest, 3);
    const route = simulatedRoute(start, dest, 40);
    let i = 0;
    setTrail([]);
    setMode("sim");
    send(route[0]);
    simTimer.current = setInterval(() => {
      i += 1;
      if (i >= route.length) return stop();
      send(route[i]);
    }, 1500);
  };

  const markStatus = async (status, otp) => {
    setError("");
    try {
      await ordersApi.updateStatus(id, status, otp);
      if (status === "Delivered") {
        stop();
        setAskOtp(false);
      }
      await load();
    } catch (err) {
      const message = errorMessage(err, "Status update failed");
      if (status === "Delivered") throw new Error(message);
      setError(message);
    }
  };

  if (!info && !error) return <LoadingState label="Loading order…" />;
  if (!info) return <Alert>{error}</Alert>;

  const live = info.status === "Out for Delivery";

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery route" subtitle={`Order #${String(info.orderId).slice(-6).toUpperCase()} · ${info.location}`}
        actionHref="/delivery" actionLabel="← Dashboard" />
      <section className="card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={info.status} />
          {info.customerName && <p className="text-sm text-slate-600">Customer: <b className="text-slate-900">{info.customerName}</b></p>}
        </div>
        <Alert onClose={() => setError("")}>{error}</Alert>

        {!live ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <span>Location sharing is available while the order is <b>Out for Delivery</b>.</span>
            {info.status === "Accepted" && <button onClick={() => markStatus("Out for Delivery")} className="btn-primary">Start delivery</button>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {mode === "gps" ? (
              <button onClick={stop} className="btn-secondary">⏹ Stop sharing</button>
            ) : (
              <button onClick={startGps} className="btn-primary">📡 Share my live location</button>
            )}
            {mode === "sim" ? (
              <button onClick={stop} className="btn-secondary">⏹ Stop simulation</button>
            ) : (
              <button onClick={startSim} className="btn-secondary">🧪 Simulate route</button>
            )}
            <button onClick={() => setAskOtp(true)} className="btn-secondary ml-auto">✅ Mark delivered</button>
          </div>
        )}
        {mode && (
          <p className="text-xs font-medium text-emerald-700">
            {mode === "gps" ? "Sharing your GPS location with the customer…" : "Simulating a drive to the customer (updates every 1.5 s)…"}
          </p>
        )}
        {live && <TrackingStats rider={me} destination={info.destination} updatedAt={me?.updatedAt} />}
        {info.status === "Delivered" && <Alert type="success">Delivered. Great job!</Alert>}
        <TrackingMap destination={info.destination} rider={me} trail={trail} />
      </section>
      {askOtp && <OtpPrompt onClose={() => setAskOtp(false)} onSubmit={(otp) => markStatus("Delivered", otp)} />}
    </div>
  );
}
