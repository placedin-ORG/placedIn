const express = require('express');
const router = express.Router();
const Course = require('../models/courseModel'); // Adjust path as needed

// Add or update a rating
router.post('/:courseId/rate', async (req, res) => {
  const { courseId } = req.params;
  const { userId, rating } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has already rated
    const existingRating = course.rating.find(r => r.userId.toString() === userId);

    if (existingRating) {
      existingRating.rating = rating; // Update existing rating
    } else {
      course.rating.push({ userId, rating }); // Add new rating
    }

    await course.save();
    res.status(200).json({ message: 'Rating updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
