import React, { useState, useEffect } from "react";
import axios from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: "",
    endDate: "",
    instructions: "",
    refills: 0,
  });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get("/prescriptions");
      setPrescriptions(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/prescriptions", formData);
      setSuccess("Prescription created successfully!");
      setFormData({
        patientId: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        startDate: "",
        endDate: "",
        instructions: "",
        refills: 0,
      });
      setShowForm(false);
      fetchPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create prescription");
    }
  };

  const handleRequestRefill = async (prescriptionId) => {
    try {
      await axios.patch(`/prescriptions/${prescriptionId}/refill`);
      setSuccess("Refill requested successfully!");
      fetchPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request refill");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading prescriptions...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Prescriptions</h1>
        <p className="text-gray-600">Manage medications and prescription refills</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Add Prescription Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancel" : "+ New Prescription"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Create Prescription</h3>
          <form onSubmit={handleCreatePrescription} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Patient ID *"
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Medication Name *"
              required
              value={formData.medication}
              onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Dosage *"
              required
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Frequency *"
              required
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Duration *"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              placeholder="Start Date *"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              placeholder="End Date *"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Refills"
              value={formData.refills}
              onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) })}
              className="border rounded px-3 py-2"
            />
            <textarea
              placeholder="Instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="md:col-span-2 border rounded px-3 py-2"
              rows="3"
            ></textarea>
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              Create Prescription
            </button>
          </form>
        </div>
      )}

      {/* Prescriptions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Medication</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Frequency</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Refills Left</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx) => (
              <tr key={rx._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-sm">{rx.medication}</td>
                <td className="px-6 py-4 text-sm">{rx.dosage}</td>
                <td className="px-6 py-4 text-sm">{rx.frequency}</td>
                <td className="px-6 py-4 text-sm">{rx.duration}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={rx.status}>{rx.status}</StatusBadge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">{rx.refillsRemaining}</td>
                <td className="px-6 py-4 text-sm">
                  {rx.status === "active" && rx.refillsRemaining > 0 && (
                    <button
                      onClick={() => handleRequestRefill(rx._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Request Refill
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prescriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No prescriptions found</p>
        </div>
      )}
    </div>
  );
}
