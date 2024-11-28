const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Course = require("../models/courseModel"); // Assuming you have a course model defined

// Fetch comments for a specific course
router.get("/:courseId/comments", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course.discussion); // Return the discussion (comments) array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a new comment
router.post("/:courseId/comments", async (req, res) => {
  const { username, comment, userId } = req.body;
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const newComment = {
      username: username,
      comment: comment,
      userId: userId,
      timestamp: Date.now(),
    };

    course.discussion.push(newComment);
    await course.save();

    res.status(201).json(newComment); // Respond with the newly added comment
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
