const mongoose = require("mongoose");

const internshipWishlist = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Internship" },
}, { timestamps: true });

module.exports = mongoose.model("InternshipWishlist", internshipWishlist);