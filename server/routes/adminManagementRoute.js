const express = require("express");
const router = express.Router();
const {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,

  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../controllers/adminManagementController");

// --- IMPORTANT ---
// You MUST protect these routes in your main server file
// using your authentication middleware.
// Example: app.use("/api/v1/admin", isAuthenticated, authorizeRoles('admin'), adminManagementRoute);

// Create a new teacher
router.post("/teacher", createTeacher);

// Get all teachers (with search & pagination)
router.get("/teachers", getAllTeachers);

// Get, Update, and Delete a specific teacher
router.get("/teacher/:id", getTeacherById);
router.put("/teacher/:id", updateTeacher);
router.delete("/teacher/:id", deleteTeacher);

router.post("/company", createCompany);
router.get("/companies", getAllCompanies);
router.get("/company/:id", getCompanyById);
router.put("/company/:id", updateCompany);
router.delete("/company/:id", deleteCompany);

module.exports = router;