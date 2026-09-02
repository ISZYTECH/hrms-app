import React, { useEffect, useState, useCallback } from "react";
import { Calendar, FileText, FlaskConical, Bell, Plus, Loader2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function PatientDashboard() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [bookForm, setBookForm] = useState({ doctorId: "", date: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [apptsRes, recordsRes, labRes, doctorsRes] = await Promise.all([
        api.get("/appointments"),
        api.get(`/records/patient/${user._id}`),
        api.get(`/lab-results/patient/${user._id}`),
        api.get("/users?role=doctor"),
      ]);
      setAppointments(apptsRes.data);
      setRecords(recordsRes.data);
      setLabResults(labRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => { load(); }, [load]);

  const bookAppointment = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.post("/appointments", bookForm);
      setMsg("Appointment requested successfully.");
      setShowBook(false);
      setBookForm({ doctorId: "", date: "", reason: "" });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setBusy(false);
    }
  };

  const updateNotifyPref = async (channel, value) => {
    const notifyBy = { ...user.notifyBy, [channel]: value };
    const { data } = await api.patch(`/users/${user._id}`, { notifyBy });
    setUser(data);
    localStorage.setItem("hrms_user", JSON.stringify(data));
  };

  const tabs = [
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "records", label: "Medical Records", icon: FileText },
    { key: "lab", label: "Lab Results", icon: FlaskConical },
    { key: "settings", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Your health records, appointments, and results in one place.</p>
        </div>
        <button onClick={() => setShowBook(true)} className="btn-accent px-4 py-2.5 rounded-md text-sm flex items-center gap-2">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            className="px-3 py-2 rounded-md text-sm flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background: tab === t.key ? "var(--dark)" : "var(--paper)",
              color: tab === t.key ? "white" : "var(--ink)",
              border: "1px solid var(--line)",
              cursor: "pointer",
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--primary)" }} /></div>
      ) : (
        <>
          {tab === "appointments" && (
            <div className="flex flex-col gap-3">
              {appointments.length === 0 && <EmptyState text="No appointments yet. Book one to get started." />}
              {appointments.map((a) => (
                <div key={a._id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Dr. {a.doctor?.name} <span style={{ color: "var(--muted)" }}>· {a.doctor?.specialty}</span></p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{new Date(a.date).toLocaleString()} — {a.reason}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}

          {tab === "records" && (
            <div className="flex flex-col gap-3">
              {records.length === 0 && <EmptyState text="No medical records yet." />}
              {records.map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{r.diagnosis}</p>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Dr. {r.doctor?.name} · {r.doctor?.specialty}</p>
                  {r.prescription?.length > 0 && (
                    <ul className="mt-2 text-xs list-disc pl-4" style={{ color: "var(--ink)" }}>
                      {r.prescription.map((p, i) => (
                        <li key={i}>{p.medication} {p.dosage && `— ${p.dosage}`} {p.instructions && `(${p.instructions})`}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "lab" && (
            <div className="flex flex-col gap-3">
              {labResults.length === 0 && <EmptyState text="No lab results yet." />}
              {labResults.map((l) => (
                <div key={l._id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{l.testName}</p>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{new Date(l.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-1">{l.result} {l.normalRange && <span style={{ color: "var(--muted)" }}>(normal: {l.normalRange})</span>}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && (
            <div className="card p-5 max-w-md">
              <p className="font-medium text-sm mb-3">How should we remind you about appointments?</p>
              {["email", "sms", "call"].map((ch) => (
                <label key={ch} className="flex items-center gap-2 text-sm mb-2" style={{ textTransform: "capitalize" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(user.notifyBy?.[ch])}
                    onChange={(e) => updateNotifyPref(ch, e.target.checked)}
                  />
                  {ch === "sms" ? "SMS" : ch}
                </label>
              ))}
              <p className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
                SMS and voice call reminders require the backend to have Twilio configured — otherwise they're simulated (logged) automatically.
              </p>
            </div>
          )}
        </>
      )}

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <form onSubmit={bookAppointment} className="card p-6 w-full max-w-sm flex flex-col gap-3">
            <h2 className="font-display font-bold text-lg">Book an appointment</h2>
            <select required value={bookForm.doctorId} onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })} className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}>
              <option value="">Select a doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialty || "General"}</option>)}
            </select>
            <input required type="datetime-local" value={bookForm.date} onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })} className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
            <textarea required placeholder="Reason for visit" value={bookForm.reason} onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })} rows={3} className="px-3 py-2.5 text-sm rounded-md resize-none" style={{ border: "1px solid var(--line)" }} />
            {msg && <p className="text-xs" style={{ color: "var(--muted)" }}>{msg}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowBook(false)} className="btn-outline flex-1 py-2.5 rounded-md text-sm">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary flex-1 py-2.5 rounded-md text-sm flex items-center justify-center gap-2">
                {busy ? <Loader2 size={14} className="animate-spin" /> : "Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>{text}</div>;
}
