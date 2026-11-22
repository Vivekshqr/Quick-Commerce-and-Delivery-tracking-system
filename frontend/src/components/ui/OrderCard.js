import StatusBadge from "./StatusBadge";

export default function OrderCard({ order, children }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{order.product}</p>
          <p className="mt-0.5 text-xs text-slate-400">Order #{String(order._id).slice(-6).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Quantity</dt>
          <dd className="font-medium text-slate-800">{order.quantity}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-slate-500">Delivery location</dt>
          <dd className="break-words font-medium text-slate-800">{order.location}</dd>
        </div>
      </dl>
      {children}
    </li>
  );
}
