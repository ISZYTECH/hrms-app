import React, { useEffect, useState, useCallback } from "react";
import { Users, Calendar, Bell, Activity, Loader2 } from "lucide-react";
import api from "../api/client";

const roleColors = { patient: "var(--primary)", doctor: "var(--secondary)", lab: "var(--accent)", admin: "var(--dark)" };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("patient");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get(`/users?role=${roleFilter}`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (u) => {
    await api.patch(`/users/${u._id}/deactivate`, { isActive: !u.isActive });
    load();
  };

  const changeRole = async (u, role) => {
    await api.patch(`/users/${u._id}/role`, { role });
    load();
  };

  const cards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users },
        { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar },
        { label: "Upcoming Appointments", value: stats.upcomingAppointments, icon: Activity },
        { label: "Notifications Sent", value: stats.notificationsSent, icon: Bell },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-1">Admin Overview</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>System-wide activity and user management.</p>

      {loading && !stats ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: "var(--primary)" }} /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="card p-4">
                <c.icon size={18} style={{ color: "var(--primary)" }} />
                <p className="font-display font-bold text-2xl mt-2">{c.value}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{c.label}</p>
              </div>
            ))}
          </div>

          {stats?.usersByRole && (
            <div className="flex gap-3 mb-6 flex-wrap">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <span key={role} className="text-xs px-3 py-1.5 rounded-full text-white" style={{ background: roleColors[role] || "var(--muted)", textTransform: "capitalize" }}>
                  {role}: {count}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-sm">Manage Users</p>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 text-sm rounded-md" style={{ border: "1px solid var(--line)" }}>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="lab">Lab Technicians</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div key={u._id} className="card p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{u.name} {!u.isActive && <span className="badge badge-cancelled ml-2">inactive</span>}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                    className="text-xs px-2 py-1 rounded-md" style={{ border: "1px solid var(--line)" }}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="lab">Lab</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => toggleActive(u)} className="btn-outline text-xs px-3 py-1.5 rounded-md">
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-xs" style={{ color: "var(--muted)" }}>No users with this role yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
