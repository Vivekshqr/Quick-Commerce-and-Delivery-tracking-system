"use client";
import { useState } from "react";
import Link from "next/link";
import { authApi, errorMessage } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import { Alert, Spinner } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { message } = await authApi.forgotPassword(email);
      setDone(message);
    } catch (err) {
      setError(errorMessage(err, "Could not start password reset"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="We'll create a link to set a new password."
      footer={<>Remembered it? <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to login</Link></>}>
      <Alert onClose={() => setError("")}>{error}</Alert>
      {done ? (
        <div className="space-y-3">
          <Alert type="success">{done}</Alert>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Development mode: there is no email service, so the reset link is printed in the <b>backend console</b> (or <code>backend/backend.log</code>). Open it within 15 minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Spinner className="h-4 w-4" />}Send reset link
          </button>
        </form>
      )}
    </AuthCard>
  );
}
