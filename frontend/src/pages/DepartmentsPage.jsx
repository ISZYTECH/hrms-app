import React, { useState, useEffect } from "react";
import axios from "../api/client";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    floor: "",
    location: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/departments");
      setDepartments(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/departments", formData);
      setSuccess("Department created successfully!");
      setFormData({
        name: "",
        description: "",
        floor: "",
        location: "",
        phone: "",
        email: "",
      });
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create department");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading departments...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Departments</h1>
        <p className="text-gray-600">Manage hospital departments and locations</p>
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

      {/* Add Department Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancel" : "+ Add Department"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Create Department</h3>
          <form onSubmit={handleCreateDepartment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Department Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Floor"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="md:col-span-2 border rounded px-3 py-2"
              rows="3"
            ></textarea>
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              Create Department
            </button>
          </form>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h3>
            {dept.description && <p className="text-gray-600 text-sm mb-4">{dept.description}</p>}
            
            <div className="space-y-2 text-sm">
              {dept.floor && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-24">Floor:</span>
                  <span className="font-semibold">{dept.floor}</span>
                </div>
              )}
              {dept.location && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-24">Location:</span>
                  <span className="font-semibold">{dept.location}</span>
                </div>
              )}
              {dept.phone && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-24">Phone:</span>
                  <span className="font-semibold">{dept.phone}</span>
                </div>
              )}
              {dept.email && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-24">Email:</span>
                  <span className="font-semibold text-blue-600">{dept.email}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Staff:</span>
                <span className="font-semibold">{dept.staffCount || 0} members</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">Edit</button>
              <button className="text-red-600 hover:text-red-700 text-sm font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No departments found</p>
        </div>
      )}
    </div>
  );
}
