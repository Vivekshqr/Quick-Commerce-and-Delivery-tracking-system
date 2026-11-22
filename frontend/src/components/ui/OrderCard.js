import StatusBadge from "./StatusBadge";
import { formatPrice } from "@/lib/format";

export default function OrderCard({ order, children }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">
            {order.items?.length ? `${order.items.length} item${order.items.length > 1 ? "s" : ""}` : order.product}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Order #{String(order._id).slice(-6).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      {order.items?.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
          {order.items.map((i) => (
            <li key={String(i.productId)} className="flex justify-between gap-2">
              <span className="truncate text-slate-700">{i.name} <span className="text-slate-400">×{i.quantity}</span></span>
              <span className="font-medium text-slate-800">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </li>
        </ul>
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Quantity</dt>
          <dd className="font-medium text-slate-800">{order.quantity}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-slate-500">Delivery location</dt>
          <dd className="break-words font-medium text-slate-800">{order.location}</dd>
          {order.locationCoords?.lat != null && (
            <a className="text-xs text-indigo-600 hover:underline" target="_blank" rel="noreferrer"
              href={`https://www.openstreetmap.org/?mlat=${order.locationCoords.lat}&mlon=${order.locationCoords.lng}#map=17/${order.locationCoords.lat}/${order.locationCoords.lng}`}>
              📍 Open in map
            </a>
          )}
        </div>
      </dl>
      {children}
    </li>
  );
}
