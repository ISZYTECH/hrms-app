import React, { useState } from "react";
import { Search, FlaskConical, Loader2, Plus } from "lucide-react";
import api from "../api/client";

export default function LabDashboard() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ testName: "", result: "", normalRange: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const search = async (e) => {
    e.preventDefault();
    setSearching(true);
    try {
      const { data } = await api.get("/users?role=patient");
      const filtered = query.trim()
        ? data.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.email.toLowerCase().includes(query.toLowerCase()))
        : data;
      setPatients(filtered);
    } finally {
      setSearching(false);
    }
  };

  const selectPatient = async (p) => {
    setSelected(p);
    setMsg("");
    const { data } = await api.get(`/lab-results/patient/${p._id}`);
    setResults(data);
  };

  const uploadResult = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await api.post("/lab-results", { patientId: selected._id, ...form });
      setMsg("Result uploaded and patient notified.");
      setForm({ testName: "", result: "", normalRange: "", notes: "" });
      const { data } = await api.get(`/lab-results/patient/${selected._id}`);
      setResults(data);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to upload result.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-1">Laboratory</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Search a patient to view or upload lab results.</p>

      <form onSubmit={search} className="flex gap-2 mb-6 max-w-md">
        <input
          value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patient by name or email"
          className="flex-1 px-3 py-2.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}
        />
        <button type="submit" className="btn-primary px-4 rounded-md flex items-center gap-1.5">
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </button>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium mb-2">Patients</p>
          <div className="flex flex-col gap-2">
            {patients.map((p) => (
              <button
                key={p._id} onClick={() => selectPatient(p)}
                className="card p-3 text-left text-sm flex items-center justify-between"
                style={{ cursor: "pointer", borderColor: selected?._id === p._id ? "var(--primary)" : "var(--line)" }}
              >
                <span>{p.name}</span>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>{p.email}</span>
              </button>
            ))}
            {patients.length === 0 && <p className="text-xs" style={{ color: "var(--muted)" }}>Search to find a patient.</p>}
          </div>
        </div>

        <div>
          {selected ? (
            <>
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><FlaskConical size={15} style={{ color: "var(--primary)" }} /> {selected.name}'s Results</p>
              <div className="flex flex-col gap-2 mb-4">
                {results.map((r) => (
                  <div key={r._id} className="card p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{r.testName}</span>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs mt-1">{r.result}</p>
                  </div>
                ))}
                {results.length === 0 && <p className="text-xs" style={{ color: "var(--muted)" }}>No results yet.</p>}
              </div>

              <form onSubmit={uploadResult} className="card p-4 flex flex-col gap-2">
                <p className="text-sm font-medium flex items-center gap-1.5"><Plus size={14} /> Upload new result</p>
                <input required placeholder="Test name" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} className="px-3 py-2 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
                <input required placeholder="Result" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} className="px-3 py-2 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
                <input placeholder="Normal range (optional)" value={form.normalRange} onChange={(e) => setForm({ ...form, normalRange: e.target.value })} className="px-3 py-2 text-sm rounded-md" style={{ border: "1px solid var(--line)" }} />
                <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="px-3 py-2 text-sm rounded-md resize-none" style={{ border: "1px solid var(--line)" }} />
                {msg && <p className="text-xs" style={{ color: "var(--muted)" }}>{msg}</p>}
                <button type="submit" disabled={busy} className="btn-accent py-2 rounded-md text-sm flex items-center justify-center gap-2">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : "Upload Result"}
                </button>
              </form>
            </>
          ) : (
            <div className="card p-8 text-center text-sm" style={{ color: "var(--muted)" }}>Select a patient to view or upload results.</div>
          )}
        </div>
      </div>
    </div>
  );
}
