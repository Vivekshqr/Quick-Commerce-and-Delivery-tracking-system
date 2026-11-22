"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, clearSession, errorMessage } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import { Alert, Spinner } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      clearSession();
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(errorMessage(err, "Could not reset password"));
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account."
      footer={<Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to login</Link>}>
      <Alert onClose={() => setError("")}>{error}</Alert>
      {token === "" ? (
        <Alert>This link is missing its reset token. <Link href="/forgot-password" className="underline">Request a new link</Link>.</Alert>
      ) : done ? (
        <Alert type="success">Password updated! Taking you to the login page…</Alert>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="password" className="label">New password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" minLength={6} autoComplete="new-password" required />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm new password</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" minLength={6} autoComplete="new-password" required />
          </div>
          <button type="submit" disabled={loading || token === null} className="btn-primary w-full">
            {loading && <Spinner className="h-4 w-4" />}Update password
          </button>
        </form>
      )}
    </AuthCard>
  );
}
