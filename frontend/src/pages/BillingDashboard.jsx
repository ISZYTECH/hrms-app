import React, { useState, useEffect } from "react";
import axios from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function BillingDashboard() {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCollected: 0,
    pendingAmount: 0,
    paidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchBills();
    fetchReport();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get("/billing/bills");
      setBills(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bills");
    }
  };

  const fetchReport = async () => {
    try {
      const response = await axios.get("/billing/reports");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      await axios.patch(`/billing/bills/${selectedBill._id}/payment`, {
        amount: parseFloat(paymentAmount),
        paymentMethod: "card",
      });
      setShowPaymentModal(false);
      setPaymentAmount("");
      fetchBills();
      fetchReport();
      alert("Payment recorded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading billing data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Billing Dashboard</h1>
        <p className="text-gray-600">Manage invoices and payment tracking</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-gray-600 text-sm font-semibold">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-600">${stats.totalRevenue?.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-gray-600 text-sm font-semibold">Amount Collected</div>
          <div className="text-2xl font-bold text-green-600">${stats.totalCollected?.toFixed(2)}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-gray-600 text-sm font-semibold">Pending Amount</div>
          <div className="text-2xl font-bold text-yellow-600">${stats.pendingAmount?.toFixed(2)}</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-gray-600 text-sm font-semibold">Paid Bills</div>
          <div className="text-2xl font-bold text-purple-600">{stats.paidCount}</div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bill #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Paid</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Balance</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-sm">{bill.billNumber}</td>
                <td className="px-6 py-4 text-sm">{bill.patient?.name}</td>
                <td className="px-6 py-4 text-sm font-semibold">${bill.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">${bill.amountPaid.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-red-600 font-semibold">${bill.balanceAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={bill.status}>{bill.status}</StatusBadge>
                </td>
                <td className="px-6 py-4 text-sm">
                  {bill.balanceAmount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowPaymentModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Record Payment</h2>
            <p className="text-gray-600 mb-4">Bill: {selectedBill.billNumber}</p>
            <p className="text-sm text-gray-600 mb-4">
              Balance: ${selectedBill.balanceAmount.toFixed(2)}
            </p>

            <form onSubmit={handlePayment}>
              <input
                type="number"
                placeholder="Payment Amount"
                step="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
                max={selectedBill.balanceAmount}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition"
                >
                  Pay
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No bills found</p>
        </div>
      )}
    </div>
  );
}
