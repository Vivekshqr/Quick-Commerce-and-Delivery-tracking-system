"use client";
import { useState } from "react";
import { Alert, Spinner } from "@/components/ui";

// Asks the partner for the customer's 4-digit delivery code.
export default function OtpPrompt({ onSubmit, onClose }) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp)) return setError("Enter the 4-digit code.");
    setBusy(true);
    setError("");
    try {
      await onSubmit(otp);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Confirm delivery</h2>
        <p className="mt-1 text-sm text-slate-500">Ask the customer for the 4-digit delivery OTP shown in their app.</p>
        <div className="mt-4"><Alert onClose={() => setError("")}>{error}</Alert></div>
        <input autoFocus inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="input text-center font-mono text-2xl tracking-[0.5em]" placeholder="••••" aria-label="Delivery OTP" />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">{busy && <Spinner className="h-4 w-4" />}Mark delivered</button>
        </div>
      </form>
    </div>
  );
}
