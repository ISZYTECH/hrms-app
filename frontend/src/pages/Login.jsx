import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleHome = { patient: "/patient", doctor: "/doctor", lab: "/lab", admin: "/admin" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div style={{ background: "var(--dark)" }} className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <HeartPulse size={22} color="var(--accent)" />
          </div>
          <h1 className="font-display font-bold text-2xl">Sign in to HRMS</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Health Record Management System</p>
        </div>

        <form onSubmit={submit} className="card p-6 flex flex-col gap-3">
          <input
            required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          <input
            required type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          {error && <p className="text-xs" style={{ color: "#B23A3A" }}>{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2">
            {busy ? <Loader2 size={15} className="animate-spin" /> : "Log in"}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up</Link>
        </p>

        <div className="mt-6 p-3 rounded-md text-xs" style={{ background: "#EAF6F5", color: "var(--muted)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--ink)" }}>Demo accounts (after running the seed script):</p>
          <p>patient@hrms.local · doctor@hrms.local · lab@hrms.local · admin@hrms.local</p>
          <p>Password for all: password123</p>
        </div>
      </div>
    </div>
  );
}
