const asyncHandler = require("express-async-handler");
const Department = require("../models/Department");

// @route  POST /api/departments
// @access Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, headOfDepartment, floor, location, phone, email } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Department name is required");
  }

  const department = await Department.create({
    name,
    description,
    headOfDepartment,
    floor,
    location,
    phone,
    email,
  });

  res.status(201).json(department);
});

// @route  GET /api/departments
// @access Private
const listDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate("headOfDepartment", "name email")
    .sort({ name: 1 });

  res.json(departments);
});

// @route  GET /api/departments/:id
// @access Private
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate(
    "headOfDepartment",
    "name email"
  );

  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  res.json(department);
});

// @route  PATCH /api/departments/:id
// @access Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  res.json(department);
});

module.exports = { createDepartment, listDepartments, getDepartment, updateDepartment };
