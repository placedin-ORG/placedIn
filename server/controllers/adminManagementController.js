const Admin = require("../models/adminModel"); // Path to your Admin model
const bcrypt = require("bcryptjs");

/**
 * @desc    Create a new teacher
 * @route   POST /api/v1/admin/teacher
 * @access  Private (Admin)
 */
exports.createTeacher = async (req, res) => {
  const { name, email, password, domain, bio } = req.body;

  try {
    const existingTeacher = await Admin.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newTeacher = new Admin({
      name,
      email,
      password, // Password will be auto-hashed by the pre-save hook
      domain,
      bio,
      role: "teacher", // Explicitly set the role
    });

    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher account created successfully",
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get all teachers with search and pagination
 * @route   GET /api/v1/admin/teachers
 * @access  Private (Admin)
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const query = {
      role: "teacher",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const teachers = await Admin.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire") // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalTeachers = await Admin.countDocuments(query);
    const totalPages = Math.ceil(totalTeachers / limitNum);

    res.status(200).json({
      success: true,
      teachers,
      pagination: {
        totalTeachers,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get a single teacher by ID
 * @route   GET /api/v1/admin/teacher/:id
 * @access  Private (Admin)
 */
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.id).select("-password");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update a teacher's details
 * @route   PUT /api/v1/admin/teacher/:id
 * @access  Private (Admin)
 */
exports.updateTeacher = async (req, res) => {
  const { name, email, domain, bio, password } = req.body;
  
  try {
    const teacher = await Admin.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== teacher.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      teacher.email = email;
    }

    teacher.name = name || teacher.name;
    teacher.domain = domain || teacher.domain;
    teacher.bio = bio || teacher.bio;

    // Optionally allow password reset
    if (password) {
      teacher.password = password; // The pre-save hook will hash it
    }

    const updatedTeacher = await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Delete a teacher
 * @route   DELETE /api/v1/admin/teacher/:id
 * @access  Private (Admin)
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Admin.findById(req.params.id);

    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // You might want to handle what happens to their courses first
    // For now, we'll just delete the teacher
    await teacher.deleteOne();

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



exports.createCompany = async (req, res) => {
  const { name, email, password, domain, bio } = req.body;

  try {
    const existingCompany = await Admin.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newCompany = new Admin({
      name,
      email,
      password, // Password will be auto-hashed
      domain,
      bio,
      role: "company", // Explicitly set the role
    });

    await newCompany.save();

    res.status(201).json({
      success: true,
      message: "Company account created successfully",
      company: newCompany,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get all companies with search and pagination
 * @route   GET /api/v1/admin/companies
 * @access  Private (Admin)
 */
exports.getAllCompanies = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      role: "company",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const companies = await Admin.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCompanies = await Admin.countDocuments(query);
    const totalPages = Math.ceil(totalCompanies / limitNum);

    res.status(200).json({
      success: true,
      companies,
      pagination: {
        totalCompanies,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get a single company by ID
 * @route   GET /api/v1/admin/company/:id
 * @access  Private (Admin)
 */
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Admin.findById(req.params.id).select("-password");
    if (!company || company.role !== "company") {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update a company's details
 * @route   PUT /api/v1/admin/company/:id
 * @access  Private (Admin)
 */
exports.updateCompany = async (req, res) => {
  const { name, email, domain, bio, password } = req.body;
  
  try {
    const company = await Admin.findById(req.params.id);
    if (!company || company.role !== "company") {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    if (email && email !== company.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      company.email = email;
    }

    company.name = name || company.name;
    company.domain = domain || company.domain;
    company.bio = bio || company.bio;

    if (password) {
      company.password = password;
    }

    const updatedCompany = await company.save();

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Delete a company
 * @route   DELETE /api/v1/admin/company/:id
 * @access  Private (Admin)
 */
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Admin.findById(req.params.id);

    if (!company || company.role !== "company") {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // You might want to handle deleting their jobs/internships first
    await company.deleteOne();

    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};