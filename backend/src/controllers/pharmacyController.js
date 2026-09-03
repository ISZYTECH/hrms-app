const asyncHandler = require("express-async-handler");
const Pharmacy = require("../models/Pharmacy");

// @route  POST /api/pharmacy/drugs
// @access Private/Admin
const addDrug = asyncHandler(async (req, res) => {
  const { drugName, genericName, category, stock, unitPrice, manufacturer } = req.body;

  if (!drugName || !category || stock === undefined || !unitPrice) {
    res.status(400);
    throw new Error("Required fields missing");
  }

  const drug = await Pharmacy.create({
    drugName,
    genericName,
    category,
    stock,
    unitPrice,
    manufacturer,
  });

  res.status(201).json(drug);
});

// @route  GET /api/pharmacy/drugs
// @access Private
const listDrugs = asyncHandler(async (req, res) => {
  const { category, search, lowStockOnly } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.drugName = { $regex: search, $options: "i" };
  if (lowStockOnly === "true") {
    filter.$expr = { $lte: ["$stock", "$reorderLevel"] };
  }

  const drugs = await Pharmacy.find(filter).sort({ drugName: 1 });
  res.json(drugs);
});

// @route  PATCH /api/pharmacy/drugs/:id
// @access Private/Admin
const updateDrug = asyncHandler(async (req, res) => {
  const drug = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!drug) {
    res.status(404);
    throw new Error("Drug not found");
  }
  res.json(drug);
});

// @route  PATCH /api/pharmacy/drugs/:id/stock
// @access Private/Admin
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, action } = req.body; // action: "add" or "remove"

  const drug = await Pharmacy.findById(req.params.id);
  if (!drug) {
    res.status(404);
    throw new Error("Drug not found");
  }

  if (action === "add") {
    drug.stock += quantity;
  } else if (action === "remove") {
    if (drug.stock < quantity) {
      res.status(400);
      throw new Error("Insufficient stock");
    }
    drug.stock -= quantity;
  }

  await drug.save();
  res.json({ message: "Stock updated", drug });
});

module.exports = { addDrug, listDrugs, updateDrug, updateStock };
