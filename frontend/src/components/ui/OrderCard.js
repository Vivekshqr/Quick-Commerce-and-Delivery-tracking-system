import StatusBadge from "./StatusBadge";
import { formatPrice } from "@/lib/format";
import { MapPinIcon } from "@/components/icons";

const STEPS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

function Progress({ status }) {
  if (status === "Cancelled") return <div className="mt-3 h-1.5 rounded-full bg-red-100" />;
  const step = STEPS.indexOf(status);
  return (
    <div className="mt-3 grid grid-cols-4 gap-1" aria-hidden="true">
      {STEPS.map((s, i) => (
        <div key={s} className={`h-1.5 rounded-full transition-colors duration-500 ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}

export default function OrderCard({ order, children }) {
  const when = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null;
  return (
    <li className="lift animate-fade-up rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">
            {order.items?.length ? `${order.items.length} item${order.items.length > 1 ? "s" : ""}` : order.product}
            {order.total != null && <span className="ml-2 font-extrabold text-brand-600">{formatPrice(order.total)}</span>}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-mono font-semibold">#{String(order._id).slice(-6).toUpperCase()}</span>
            {when && <> · {when}</>}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <Progress status={order.status} />
      {order.items?.length > 0 && (
        <ul className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
          {order.items.map((i) => (
            <li key={String(i.productId)} className="flex justify-between gap-2">
              <span className="truncate text-slate-700">{i.name} <span className="text-slate-400">×{i.quantity}</span></span>
              <span className="font-semibold text-slate-800">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </li>
        </ul>
      )}
      <div className="mt-3 flex items-start gap-2 text-sm">
        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0 flex-1">
          <p className="break-words font-medium text-slate-800">{order.location}</p>
          <p className="text-xs text-slate-500">
            Qty {order.quantity}
            {order.locationCoords?.lat != null && (
              <> · <a className="font-semibold text-brand-600 hover:underline" target="_blank" rel="noreferrer"
                href={`https://www.openstreetmap.org/?mlat=${order.locationCoords.lat}&mlon=${order.locationCoords.lng}#map=17/${order.locationCoords.lat}/${order.locationCoords.lng}`}>
                Open in map
              </a></>
            )}
          </p>
        </div>
      </div>
      {children}
    </li>
  );
}
