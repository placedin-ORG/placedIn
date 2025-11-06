const Course = require("../models/courseModel");
exports.addReview = async (req, res) => {
  try {

    const { courseId } = req.params;
    const { rating, comment } = req.body;
   const {userId }= req.body;
  

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if user already reviewed
    const alreadyReviewed = course.reviews.some(
      (r) => r.userId.toString() === userId.toString()
    );
    if (alreadyReviewed)
      return res
        .status(400)
        .json({ message: "You have already reviewed this course." });

    // Add new review
    course.reviews.push({ userId:userId, rating, comment });
    await course.save();

    res.status(201).json({ message: "Review added successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate(
      "reviews.userId",
      "name avatar"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({
      totalReviews: course.reviews.length,
      reviews: course.reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
