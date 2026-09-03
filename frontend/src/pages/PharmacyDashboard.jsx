import React, { useState, useEffect } from "react";
import axios from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function PharmacyDashboard() {
  const [drugs, setDrugs] = useState([]);
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [formData, setFormData] = useState({
    drugName: "",
    genericName: "",
    category: "",
    stock: 0,
    unitPrice: 0,
    manufacturer: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/pharmacy/drugs");
      setDrugs(response.data);
      const low = response.data.filter((d) => d.stock <= d.reorderLevel);
      setLowStockDrugs(low);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load drugs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrug = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/pharmacy/drugs", formData);
      setSuccess("Drug added successfully!");
      setFormData({
        drugName: "",
        genericName: "",
        category: "",
        stock: 0,
        unitPrice: 0,
        manufacturer: "",
      });
      setShowAddDrug(false);
      fetchDrugs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add drug");
    }
  };

  const handleUpdateStock = async (drugId, action) => {
    const quantity = prompt(`Enter quantity to ${action}:`);
    if (!quantity || isNaN(quantity)) return;

    try {
      await axios.patch(`/pharmacy/drugs/${drugId}/stock`, {
        quantity: parseInt(quantity),
        action,
      });
      setSuccess(`Stock ${action}ed successfully!`);
      fetchDrugs();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update stock");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading pharmacy data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pharmacy Dashboard</h1>
        <p className="text-gray-600">Manage drug inventory and stock levels</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-gray-600 text-sm font-semibold">Total Drugs</div>
          <div className="text-3xl font-bold text-blue-600">{drugs.length}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-gray-600 text-sm font-semibold">Low Stock Alert</div>
          <div className="text-3xl font-bold text-yellow-600">{lowStockDrugs.length}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-gray-600 text-sm font-semibold">In Stock</div>
          <div className="text-3xl font-bold text-green-600">
            {drugs.filter((d) => d.stock > 0).length}
          </div>
        </div>
      </div>

      {/* Add Drug Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddDrug(!showAddDrug)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {showAddDrug ? "Cancel" : "+ Add New Drug"}
        </button>
      </div>

      {/* Add Drug Form */}
      {showAddDrug && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add New Drug</h3>
          <form onSubmit={handleAddDrug} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Drug Name *"
              required
              value={formData.drugName}
              onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Generic Name"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Category *"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stock *"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Unit Price *"
              required
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              Add Drug
            </button>
          </form>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockDrugs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Low Stock Drugs</h3>
          <div className="space-y-2">
            {lowStockDrugs.map((drug) => (
              <div key={drug._id} className="flex justify-between items-center p-3 bg-white rounded">
                <div>
                  <p className="font-semibold">{drug.drugName}</p>
                  <p className="text-sm text-gray-600">Stock: {drug.stock} (Min: {drug.reorderLevel})</p>
                </div>
                <button
                  onClick={() => handleUpdateStock(drug._id, "add")}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drugs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Drug Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Unit Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Manufacturer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map((drug) => (
              <tr key={drug._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{drug.drugName}</p>
                    <p className="text-sm text-gray-600">{drug.genericName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{drug.category}</td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={drug.stock > drug.reorderLevel ? "in_stock" : "low_stock"}>
                    {drug.stock} units
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 text-sm font-semibold">${drug.unitPrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">{drug.manufacturer || "N/A"}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleUpdateStock(drug._id, "add")}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Add Stock
                  </button>
                  <button
                    onClick={() => handleUpdateStock(drug._id, "remove")}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drugs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No drugs in inventory. Add your first drug!</p>
        </div>
      )}
    </div>
  );
}
