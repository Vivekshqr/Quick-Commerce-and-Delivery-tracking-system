"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, errorMessage, markSession } from "@/lib/api";
import { homeFor } from "@/lib/roles";
import AuthCard from "@/components/AuthCard";
import { Alert, Spinner } from "@/components/ui";

const ROLES = [
  { value: "customer", title: "Customer", desc: "Place and track orders" },
  { value: "delivery", title: "Delivery partner", desc: "Accept and deliver orders" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await authApi.register({ name, email, password, role });
      markSession();
      router.push(homeFor(user.role));
    } catch (error) {
      setError(errorMessage(error, "Registration failed"));
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join as a customer or a delivery partner."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </>
      }
    >
      <Alert onClose={() => setError("")}>{error}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="input" placeholder="Jane Doe" autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input" placeholder="you@example.com" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required />
        </div>
        <fieldset>
          <legend className="label">I am a…</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-lg border p-3 transition ${
                  role === r.value
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <input type="radio" name="role" value={r.value} checked={role === r.value}
                  onChange={(e) => setRole(e.target.value)} className="sr-only" />
                <span className="block text-sm font-semibold text-slate-900">{r.title}</span>
                <span className="block text-xs text-slate-500">{r.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
