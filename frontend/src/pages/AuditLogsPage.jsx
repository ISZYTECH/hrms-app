import React, { useState, useEffect } from "react";
import axios from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      let query = "/audit/logs?";
      if (filters.action) query += `action=${filters.action}&`;
      if (filters.entityType) query += `entityType=${filters.entityType}&`;

      const response = await axios.get(query);
      setLogs(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading audit logs...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Audit Logs</h1>
        <p className="text-gray-600">Security and compliance tracking</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
          </select>
          <select
            value={filters.entityType}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Entity Types</option>
            <option value="User">User</option>
            <option value="Appointment">Appointment</option>
            <option value="Bill">Bill</option>
            <option value="Prescription">Prescription</option>
            <option value="Department">Department</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Entity Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-sm">{log.user?.name}</p>
                    <p className="text-xs text-gray-600">{log.user?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold text-xs">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{log.entityType}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={log.status}>{log.status}</StatusBadge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.ipAddress}</td>
                <td className="px-6 py-4 text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No audit logs found</p>
        </div>
      )}
    </div>
  );
}
