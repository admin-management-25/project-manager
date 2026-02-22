"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/auth/login?registered=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{ background: "var(--accent-dim)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <Shield size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="font-display text-3xl mb-1" style={{ color: "var(--text-primary)" }}>Create Account</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Set up your Vault workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-md px-4 py-3 text-sm" style={{ background: "rgba(224,90,90,0.1)", color: "var(--danger)", border: "1px solid rgba(224,90,90,0.2)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" className="input pl-9" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="input-label">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="email" className="input pl-9" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="password" className="input pl-9" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
