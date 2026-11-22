import Link from "next/link";
import { Spinner } from "@/components/ui";

const STEPS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];
const ACTIONS = [
  { status: "Accepted", label: "Accept" },
  { status: "Out for Delivery", label: "Out for delivery" },
  { status: "Delivered", label: "Mark delivered" },
];

// Status buttons for a delivery partner; the next step is highlighted, earlier ones disabled.
export default function DeliveryActions({ order, updating, onUpdate }) {
  const current = STEPS.indexOf(order.status);
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
      {ACTIONS.map((a) => {
        const step = STEPS.indexOf(a.status);
        const busy = updating === `${order._id}:${a.status}`;
        return (
          <button
            key={a.status}
            onClick={() => onUpdate(order._id, a.status)}
            disabled={step <= current || updating !== null}
            className={`${step === current + 1 ? "btn-primary" : "btn-secondary"} flex-1 px-3 py-2 text-xs sm:text-sm`}
          >
            {busy && <Spinner className="h-4 w-4" />}
            {a.label}
          </button>
        );
      })}
      {order.status !== "Pending" && (
        <Link href={`/delivery/${order._id}`} className="btn-secondary w-full py-2 text-xs sm:text-sm">
          🗺️ Open route & share location
        </Link>
      )}
    </div>
  );
}
