import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Stethoscope, Loader2, Plus, Trash2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordFor, setRecordFor] = useState(null); // appointment being diagnosed
  const [form, setForm] = useState({ diagnosis: "", notes: "", prescription: [{ medication: "", dosage: "", instructions: "" }] });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/appointments");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  };

  const openRecordForm = (appt) => {
    setRecordFor(appt);
    setForm({ diagnosis: "", notes: "", prescription: [{ medication: "", dosage: "", instructions: "" }] });
    setMsg("");
  };

  const updatePrescriptionRow = (i, field, value) => {
    const next = [...form.prescription];
    next[i] = { ...next[i], [field]: value };
    setForm({ ...form, prescription: next });
  };

  const addPrescriptionRow = () => setForm({ ...form, prescription: [...form.prescription, { medication: "", dosage: "", instructions: "" }] });
  const removePrescriptionRow = (i) => setForm({ ...form, prescription: form.prescription.filter((_, idx) => idx !== i) });

  const submitRecord = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.post("/records", {
        patientId: recordFor.patient._id,
        appointmentId: recordFor._id,
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescription: form.prescription.filter((p) => p.medication.trim()),
      });
      await api.patch(`/appointments/${recordFor._id}/status`, { status: "completed" });
      setMsg("Diagnosis & prescription saved.");
      setRecordFor(null);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to save record.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-1">Dr. {user.name.split(" ").slice(-1)[0]}'s Schedule</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{user.specialty || "General Medicine"}</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--primary)" }} /></div>
      ) : appointments.length === 0 ? (
        <div className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>No appointments yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((a) => (
            <div key={a._id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2"><Calendar size={14} style={{ color: "var(--primary)" }} /> {a.patient?.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{new Date(a.date).toLocaleString()} — {a.reason}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="flex gap-2 mt-3">
                {a.status === "pending" && (
                  <button onClick={() => setStatus(a._id, "confirmed")} className="btn-primary text-xs px-3 py-1.5 rounded-md">Confirm</button>
                )}
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <button onClick={() => openRecordForm(a)} className="btn-accent text-xs px-3 py-1.5 rounded-md flex items-center gap-1">
                    <Stethoscope size={13} /> Add Diagnosis
                  </button>
                )}
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <button onClick={() => setStatus(a._id, "cancelled")} className="btn-outline text-xs px-3 py-1.5 rounded-md">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {recordFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <form onSubmit={submitRecord} className="card p-6 w-full max-w-lg flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
            <h2 className="font-display font-bold text-lg">Diagnosis for {recordFor.patient?.name}</h2>
            <input required placeholder="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="px-3 py-2.5 text-sm rounded-md resize-none" style={{ border: "1px solid var(--line)" }} />

            <p className="text-sm font-medium mt-1">Prescription</p>
            {form.prescription.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Medication" value={p.medication} onChange={(e) => updatePrescriptionRow(i, "medication", e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
                <input placeholder="Dosage" value={p.dosage} onChange={(e) => updatePrescriptionRow(i, "dosage", e.target.value)} className="w-24 px-3 py-2 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
                <button type="button" onClick={() => removePrescriptionRow(i)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#B23A3A" }}><Trash2 size={15} /></button>
              </div>
            ))}
            <button type="button" onClick={addPrescriptionRow} className="btn-outline text-xs py-1.5 rounded-md flex items-center justify-center gap-1 w-fit px-3">
              <Plus size={13} /> Add medication
            </button>

            {msg && <p className="text-xs" style={{ color: "var(--muted)" }}>{msg}</p>}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setRecordFor(null)} className="btn-outline flex-1 py-2.5 rounded-md text-sm">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary flex-1 py-2.5 rounded-md text-sm flex items-center justify-center gap-2">
                {busy ? <Loader2 size={14} className="animate-spin" /> : "Save & Complete"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
