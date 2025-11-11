const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile } = require("../utils/cloudinary"); 
const {ExamResult}= require("../models/ExamModel");
const mongoose = require("mongoose");


const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-proctor-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    console.log("🎥 Uploading proctor video to Cloudinary...");

    const{userId,ExamId} = req.body;
    console.log("USERID EXAMID",userId,ExamId);

    
    const result = await uploadFile(req.file.buffer, "proctor_videos");

     const examResult = await ExamResult.findOneAndUpdate(
    {
    userId: new mongoose.Types.ObjectId(userId),
    ExamId: new mongoose.Types.ObjectId(ExamId), 
     },
      { proctorVideoUrl: result.secure_url },
      { new: true }
    );

    
    res.status(200).json({
      message: "Video uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("❌ Video upload failed:", error);
    res.status(500).json({ message: "Video upload failed", error });
  }
});

module.exports = router;
