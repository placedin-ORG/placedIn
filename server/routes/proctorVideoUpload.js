const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile } = require("../utils/cloudinary"); 
const {ExamResult}= require("../models/ExamModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");


const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB limit
});

router.post("/upload-proctor-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { userId, ExamId, courseId, isFinalExam } = req.body;

    console.log("🎥 Uploading proctor video...");
    console.log({ userId, ExamId, courseId, isFinalExam });

    // Upload to Cloudinary
    const result = await uploadFile(req.file.buffer, "proctor_videos");

    // =============================
    // 🔹 CASE 1 — FINAL EXAM
    // =============================
    if (isFinalExam === "true" || isFinalExam === true) {
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          "ongoingCourses.courseId": courseId,
        },
        {
          $set: {
            "ongoingCourses.$.finalExam.proctorVideoUrl": result.secure_url,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Final exam proctor video saved",
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // =============================
    // 🔹 CASE 2 — NORMAL EXAM
    // =============================
    await ExamResult.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        ExamId: new mongoose.Types.ObjectId(ExamId),
      },
      {
        proctorVideoUrl: result.secure_url,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Exam proctor video saved",
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("❌ Video upload failed:", error);
    res.status(500).json({ message: "Video upload failed", error });
  }
});


module.exports = router;
