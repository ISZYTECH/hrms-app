import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleHome = { patient: "/patient", doctor: "/doctor", lab: "/lab" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "patient", specialty: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      navigate(roleHome[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div style={{ background: "var(--dark)" }} className="w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <HeartPulse size={22} color="var(--accent)" />
          </div>
          <h1 className="font-display font-bold text-2xl">Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Join the HRMS platform</p>
        </div>

        <form onSubmit={submit} className="card p-6 flex flex-col gap-3">
          <input
            required placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          <input
            required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          <input
            required type="password" placeholder="Password (min. 6 characters)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          <input
            placeholder="Phone number" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          />
          <select
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="lab">Lab Technician</option>
          </select>
          {form.role === "doctor" && (
            <input
              placeholder="Specialty (e.g. General Medicine)" value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
            />
          )}
          {error && <p className="text-xs" style={{ color: "#B23A3A" }}>{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2">
            {busy ? <Loader2 size={15} className="animate-spin" /> : "Sign up"}
          </button>
        </form>

        <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Log in</Link>
        </p>
        <p className="text-[11px] text-center mt-2" style={{ color: "var(--muted)" }}>
          Admin accounts are created via the backend seed script, not self-registration.
        </p>
      </div>
    </div>
  );
}
