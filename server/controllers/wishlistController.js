const Internship = require("../models/internship");
const InternshipWishlist = require("../models/internshipWishlistModel");

// Add internship to wishlist
const addToWishlist = async (req, res) => {
  const { studentId, internshipId } = req.body;

  try {
    // Check if already in wishlist
    const existingWishlist = await InternshipWishlist.findOne({
      studentId,
      internshipId
    });

    if (existingWishlist) {
      return res.status(400).json({ message: "Internship already in wishlist" });
    }

    // Create new wishlist entry
    const newWishlistItem = new InternshipWishlist({
      studentId,
      internshipId
    });

    await newWishlistItem.save();

    return res.status(201).json({
      message: "Added to wishlist successfully",
      wishlist: newWishlistItem
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Remove internship from wishlist
const removeFromWishlist = async (req, res) => {
  const { studentId, internshipId } = req.body;

  try {
    const result = await InternshipWishlist.findOneAndDelete({
      studentId,
      internshipId
    });

    if (!result) {
      return res.status(404).json({ message: "Internship not found in wishlist" });
    }

    return res.status(200).json({
      message: "Removed from wishlist successfully"
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get wishlist status
const getWishlistStatus = async (req, res) => {
  const { internshipId, studentId } = req.params;

  try {
    const wishlistItem = await InternshipWishlist.findOne({
      studentId,
      internshipId
    });

    return res.status(200).json({
      isWishlisted: !!wishlistItem
    });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get all wishlisted internships for a student
const getWishlistedInternships = async (req, res) => {
  const { studentId } = req.params;

  try {
    const wishlistItems = await InternshipWishlist.find({ studentId });
    
    if (!wishlistItems.length) {
      return res.status(200).json({ internships: [] });
    }

    const internshipIds = wishlistItems.map(item => item.internshipId);
    
    const internships = await Internship.find({
      _id: { $in: internshipIds }
    });

    return res.status(200).json({ internships });
  } catch (error) {
    console.error("Error fetching wishlisted internships:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Increase view count for an internship
const increaseView = async (req, res) => {
  const { internshipId, studentId } = req.body;

  try {
    await Internship.findByIdAndUpdate(
      internshipId,
      { $inc: { view: 1 } }
    );

    return res.status(200).json({ message: "View count increased successfully" });
  } catch (error) {
    console.error("Error increasing view count:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Check enrollment status
const getEnrollmentStatus = async (req, res) => {
  const { internshipId, studentId } = req.params;

  try {
    const enrollment = await Student.findOne({
      student: studentId,
      internship: internshipId
    });

    return res.status(200).json({
      isEnrolled: !!enrollment
    });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistStatus,
  getWishlistedInternships,
 
};