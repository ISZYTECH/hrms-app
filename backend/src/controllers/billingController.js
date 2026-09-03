const asyncHandler = require("express-async-handler");
const Bill = require("../models/Bill");
const { notifyUser } = require("../services/notifyUser");
const User = require("../models/User");

// Generate unique bill number
const generateBillNumber = async () => {
  const count = await Bill.countDocuments();
  const date = new Date();
  return `BILL-${date.getFullYear()}-${String(count + 1).padStart(5, "0")}`;
};

// @route  POST /api/billing/bills
// @access Private/Admin,Doctor
const createBill = asyncHandler(async (req, res) => {
  const { patientId, items, discount = 0, tax = 0, dueDate } = req.body;

  if (!patientId || !items || items.length === 0) {
    res.status(400);
    throw new Error("Patient ID and items are required");
  }

  // Calculate totals
  let subtotal = 0;
  items.forEach((item) => {
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
  });

  const totalAmount = subtotal + tax - discount;

  const bill = await Bill.create({
    billNumber: await generateBillNumber(),
    patient: patientId,
    doctor: req.user.role === "doctor" ? req.user._id : undefined,
    items,
    subtotal,
    tax,
    discount,
    totalAmount,
    balanceAmount: totalAmount,
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
  });

  await bill.populate("patient", "name email phone");

  // Notify patient
  const patient = await User.findById(patientId);
  await notifyUser({
    user: patient,
    subject: "Bill Generated",
    message: `Your medical bill ${bill.billNumber} of amount $${totalAmount} is ready. Due date: ${bill.dueDate.toLocaleDateString()}.`,
  }).catch((e) => console.error(e.message));

  res.status(201).json(bill);
});

// @route  GET /api/billing/bills
// @access Private
const listBills = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "patient") filter.patient = req.user._id;
  else if (req.user.role === "doctor") filter.doctor = req.user._id;

  const bills = await Bill.find(filter)
    .populate("patient", "name email")
    .populate("doctor", "name")
    .sort({ createdAt: -1 });

  res.json(bills);
});

// @route  PATCH /api/billing/bills/:id/payment
// @access Private/Admin,Patient
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod } = req.body;

  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    res.status(404);
    throw new Error("Bill not found");
  }

  if (amount <= 0 || amount > bill.balanceAmount) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  bill.amountPaid += amount;
  bill.balanceAmount -= amount;
  bill.paymentMethod = paymentMethod;

  if (bill.balanceAmount === 0) {
    bill.status = "paid";
  } else if (bill.amountPaid > 0) {
    bill.status = "partial";
  }

  await bill.save();
  res.json({ message: "Payment recorded", bill });
});

// @route  GET /api/billing/reports
// @access Private/Admin
const getBillingReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const bills = await Bill.find(filter);

  const report = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    totalCollected: bills.reduce((sum, bill) => sum + bill.amountPaid, 0),
    pendingAmount: bills.reduce((sum, bill) => sum + bill.balanceAmount, 0),
    statusBreakdown: {
      paid: bills.filter((b) => b.status === "paid").length,
      pending: bills.filter((b) => b.status === "pending").length,
      partial: bills.filter((b) => b.status === "partial").length,
      overdue: bills.filter((b) => b.status === "overdue").length,
    },
  };

  res.json(report);
});

module.exports = { createBill, listBills, recordPayment, getBillingReport };
