const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const os = require("os");
const path = require("path");

// Models
const { ExamResult } = require("../models/ExamModel");
const User = require("../models/userModel");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per chunk
});

// Store active upload sessions
const uploadSessions = new Map();

// =============================
// 1. INITIALIZE UPLOAD SESSION
// =============================
router.post("/init-upload", async (req, res) => {
  try {
    const { userId, ExamId, courseId, isFinalExam } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Generate unique upload ID
    const uploadId = `proctor_${userId}_${Date.now()}`;

    // Create temp directory for this session
    const tempDir = path.join(os.tmpdir(), uploadId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Store session metadata
    uploadSessions.set(uploadId, {
      userId,
      ExamId: ExamId || null,
      courseId: courseId || null,
      isFinalExam: isFinalExam === true || isFinalExam === "true",
      startTime: new Date(),
      chunkCount: 0,
      lastActivity: new Date(),
      tempDir: tempDir,
      chunkFiles: [], // Store chunk file paths
    });

    console.log(`✅ Upload session initialized: ${uploadId}, temp dir: ${tempDir}`);

    res.status(200).json({
      message: "Upload session initialized",
      uploadId,
    });

  } catch (error) {
    console.error("❌ Init upload error:", error);
    res.status(500).json({
      message: "Failed to initialize upload session",
      error: error.message,
    });
  }
});

// =============================
// 2. UPLOAD CHUNK - Store temporarily
// =============================
router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No chunk file provided" });
    }

    const { uploadId, chunkIndex, isFinal, userId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ message: "No upload ID provided" });
    }

    // Verify session exists
    const session = uploadSessions.get(uploadId);
    if (!session) {
      return res.status(404).json({ message: "Upload session not found" });
    }

    console.log(`📥 Processing chunk ${chunkIndex} for upload ${uploadId} (${req.file.size} bytes)`);

    // Save chunk to temporary file
    tempFilePath = path.join(session.tempDir, `chunk_${chunkIndex}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Update session
    session.chunkFiles.push({
      index: parseInt(chunkIndex),
      path: tempFilePath,
    });
    session.chunkCount++;
    session.lastActivity = new Date();

    const response = {
      message: "Chunk uploaded successfully",
      chunkIndex,
      totalChunks: session.chunkCount,
    };

    // If final chunk, combine and upload to Cloudinary
    if (isFinal === "true") {
      console.log(`🔚 Final chunk received, combining and uploading to Cloudinary...`);
      
      // Combine chunks and upload
      const result = await combineAndUploadChunks(session, uploadId);
      
      response.videoUrl = result.secure_url;
      response.publicId = result.public_id;
      response.isComplete = true;
      
      // Save to database (async)
      saveVideoUrlToDatabase(session, result.secure_url, result.public_id)
        .then(() => console.log(`✅ Video saved to DB for ${uploadId}`))
        .catch(err => console.error("❌ DB save error:", err));

      // Clean up session and temp files
      cleanupSession(session);
      uploadSessions.delete(uploadId);
      
      console.log(`✅ Upload completed: ${uploadId} with ${session.chunkCount} chunks`);
    }

    // Free memory
    req.file.buffer = null;

    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Chunk upload error:", error);
    
    // Clean up temp file if it was created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    // Free memory
    if (req.file) {
      req.file.buffer = null;
    }
    
    res.status(500).json({
      message: "Chunk upload failed",
      error: error.message,
    });
  }
});



// =============================
// SIMPLIFIED UPLOAD (Without Eager Transformations)
// =============================
router.post("/upload-chunk-simple", upload.single("chunk"), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No chunk file provided" });
    }

    const { uploadId, chunkIndex, isFinal, userId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ message: "No upload ID provided" });
    }

    // Verify session exists
    const session = uploadSessions.get(uploadId);
    if (!session) {
      return res.status(404).json({ message: "Upload session not found" });
    }

    console.log(`📥 Processing chunk ${chunkIndex} (${req.file.size} bytes)`);

    // Save chunk to temporary file
    tempFilePath = path.join(session.tempDir, `chunk_${chunkIndex}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Update session
    session.chunkFiles.push({
      index: parseInt(chunkIndex),
      path: tempFilePath,
    });
    session.chunkCount++;
    session.lastActivity = new Date();

    const response = {
      message: "Chunk stored successfully",
      chunkIndex,
      totalChunks: session.chunkCount,
    };

    // If final chunk, combine and upload WITHOUT eager transformations
    if (isFinal === "true") {
      console.log(`🔚 Final chunk received, uploading to Cloudinary...`);
      
      try {
        // Sort and combine chunks
        session.chunkFiles.sort((a, b) => a.index - b.index);
        const combinedFilePath = path.join(session.tempDir, `final_${uploadId}.webm`);
        const writeStream = fs.createWriteStream(combinedFilePath);
        
        for (const chunkFile of session.chunkFiles) {
          const chunkData = fs.readFileSync(chunkFile.path);
          writeStream.write(chunkData);
        }
        writeStream.end();
        
        await new Promise((resolve) => {
          writeStream.on('finish', resolve);
        });

        // Upload WITHOUT eager transformations to avoid timeout
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            combinedFilePath,
            {
              resource_type: "video",
              public_id: uploadId,
              folder: "proctor_videos",
              // NO eager transformations
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });

        // Clean up temp files
        if (fs.existsSync(combinedFilePath)) {
          fs.unlinkSync(combinedFilePath);
        }
        cleanupSession(session);
        
        // Save to database
        await saveVideoUrlToDatabase(session, result.secure_url, result.public_id);
        
        response.videoUrl = result.secure_url;
        response.publicId = result.public_id;
        response.isComplete = true;
        response.message = "Video uploaded successfully";
        
        console.log(`✅ Upload completed: ${result.secure_url}`);
        
        uploadSessions.delete(uploadId);
        
      } catch (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        cleanupSession(session);
        throw uploadError;
      }
    }

    // Free memory
    req.file.buffer = null;

    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Chunk upload error:", error);
    
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    res.status(500).json({
      message: "Chunk upload failed",
      error: error.message,
    });
  }
});

// =============================
// 3. COMBINE CHUNKS AND UPLOAD TO CLOUDINARY
// =============================
const combineAndUploadChunks = async (session, uploadId) => {
  try {
    // Sort chunks by index
    session.chunkFiles.sort((a, b) => a.index - b.index);
    
    // Create combined file
    const combinedFilePath = path.join(session.tempDir, `combined_${uploadId}.webm`);
    const writeStream = fs.createWriteStream(combinedFilePath);
    
    // Concatenate all chunks
    for (const chunkFile of session.chunkFiles) {
      const chunkData = fs.readFileSync(chunkFile.path);
      writeStream.write(chunkData);
    }
    writeStream.end();
    
    // Wait for file to be fully written
    await new Promise((resolve) => {
      writeStream.on('finish', resolve);
    });

    const fileSize = fs.statSync(combinedFilePath).size;
    console.log(`✅ Combined ${session.chunkFiles.length} chunks into: ${combinedFilePath} (${fileSize} bytes)`);

    // Upload combined file to Cloudinary
    const result = await uploadToCloudinary(combinedFilePath, uploadId);

    // Clean up combined file
    if (fs.existsSync(combinedFilePath)) {
      fs.unlinkSync(combinedFilePath);
    }

    return result;

  } catch (error) {
    console.error("❌ Combine and upload error:", error);
    throw error;
  }
};


// =============================
// HELPER: Upload to Cloudinary with retry logic
// =============================
const uploadToCloudinary = async (filePath, uploadId) => {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading to Cloudinary (attempt ${attempt}/${maxRetries})...`);
      
      const result = await new Promise((resolve, reject) => {
        // Remove eager transformations to avoid timeout
        const options = {
          resource_type: "video",
          public_id: uploadId,
          folder: "proctor_videos",
          chunk_size: 6000000,
          // Remove eager transformations to prevent timeout
          // eager: [{ width: 640, height: 480, crop: "limit" }],
        };

        // For larger files, use upload_large
        const fileSize = fs.statSync(filePath).size;
        if (fileSize > 100000000) { // 100MB threshold
          console.log(`📦 Large file detected (${fileSize} bytes), using upload_large`);
          cloudinary.uploader.upload_large(filePath, options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        } else {
          console.log(`📦 Using regular upload for ${fileSize} bytes file`);
          cloudinary.uploader.upload(filePath, options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        }
      });

      console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
      return result;

    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} failed:`, error.message);
      
      // Check if it's just an eager transformation timeout
      if (error.http_code === 420 && error.message.includes('parallel processing')) {
        console.log("⚠️ Eager transformation timeout - checking if upload succeeded...");
        
        try {
          // Try to get the resource info
          const resource = await cloudinary.api.resource(uploadId, {
            resource_type: "video",
            type: "upload"
          });
          
          if (resource.secure_url) {
            console.log(`✅ Upload succeeded! Video URL: ${resource.secure_url}`);
            return resource;
          }
        } catch (resourceError) {
          console.log("ℹ️ Could not verify upload status, continuing with retry...");
        }
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

// =============================
// 4. CLEANUP SESSION FILES
// =============================
const cleanupSession = (session) => {
  try {
    // Delete all chunk files
    for (const chunkFile of session.chunkFiles) {
      if (fs.existsSync(chunkFile.path)) {
        fs.unlinkSync(chunkFile.path);
      }
    }
    
    // Delete temp directory if empty
    if (fs.existsSync(session.tempDir)) {
      const files = fs.readdirSync(session.tempDir);
      if (files.length === 0) {
        fs.rmdirSync(session.tempDir);
      }
    }
    
    console.log(`🧹 Cleaned up temp files for session`);
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
};

// =============================
// 5. FINALIZE UPLOAD (Updated)
// =============================
router.post("/finalize-upload", async (req, res) => {
  try {
    const { uploadId, userId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ message: "Upload ID is required" });
    }

    const session = uploadSessions.get(uploadId);
    if (session) {
      console.log(`🔚 Finalizing session: ${uploadId} with ${session.chunkCount} chunks`);
      
      let finalResult = null;
      
      // If we have chunks, combine and upload them
      if (session.chunkFiles.length > 0) {
        try {
          finalResult = await combineAndUploadChunks(session, uploadId);
          console.log(`✅ Final upload successful: ${finalResult.secure_url}`);
          
        } catch (uploadError) {
          console.error("❌ Upload failed:", uploadError.message);
          
          // Check if it's just an eager transformation timeout
          if (uploadError.http_code === 420) {
            console.log("⚠️ Eager transformation timeout - trying to get video URL anyway...");
            
            try {
              // Try to get the uploaded video
              const resource = await cloudinary.api.resource(uploadId, {
                resource_type: "video",
                type: "upload"
              });
              
              if (resource.secure_url) {
                finalResult = resource;
                console.log(`✅ Retrieved video URL despite timeout: ${resource.secure_url}`);
              }
            } catch (resourceError) {
              console.error("❌ Could not retrieve video:", resourceError.message);
            }
          }
          
          if (!finalResult) {
            throw uploadError;
          }
        } finally {
          // Always clean up
          cleanupSession(session);
        }
        
        if (finalResult) {
          // Save to database
          try {
            await saveVideoUrlToDatabase(session, finalResult.secure_url, finalResult.public_id);
            console.log(`✅ Saved to database`);
          } catch (dbError) {
            console.error("❌ Database save failed:", dbError.message);
            // Continue anyway - the video is in Cloudinary
          }
        }
      }
      
      uploadSessions.delete(uploadId);
      
      res.status(200).json({
        message: "Upload finalized successfully",
        uploadId,
        videoUrl: finalResult?.secure_url || null,
        success: !!finalResult,
      });
      
    } else {
      res.status(404).json({
        message: "Upload session not found",
        uploadId,
      });
    }

  } catch (error) {
    console.error("❌ Finalize upload error:", error);
    
    // Clean up if session exists
    const { uploadId } = req.body;
    const session = uploadSessions.get(uploadId);
    if (session) {
      cleanupSession(session);
      uploadSessions.delete(uploadId);
    }
    
    res.status(500).json({
      message: "Failed to finalize upload",
      error: error.message,
      uploadId,
    });
  }
});


// =============================
// 6. SAVE VIDEO URL TO DATABASE
// =============================
const saveVideoUrlToDatabase = async (session, videoUrl, publicId) => {
  try {
    const videoData = {
      proctorVideoUrl: videoUrl,
      proctorVideoPublicId: publicId,
      proctorVideoUploadTime: new Date(),
      proctorVideoChunkCount: session.chunkCount,
    };

    if (session.isFinalExam) {
      await User.findOneAndUpdate(
        {
          _id: session.userId,
          "ongoingCourses.courseId": session.courseId,
        },
        {
          $set: {
            "ongoingCourses.$.finalExam.proctorVideoUrl": videoUrl,
            "ongoingCourses.$.finalExam.proctorVideoPublicId": publicId,
          },
        }
      );
    } else {
      await ExamResult.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(session.userId),
          ExamId: new mongoose.Types.ObjectId(session.ExamId),
        },
        {
          $set: videoData,
        }
      );
    }
  } catch (error) {
    console.error("❌ Database save error:", error);
    throw error;
  }
};

// =============================
// 7. GET UPLOAD STATUS
// =============================
router.get("/upload-status/:uploadId", async (req, res) => {
  try {
    const { uploadId } = req.params;
    const session = uploadSessions.get(uploadId);

    if (!session) {
      return res.status(404).json({ message: "Upload session not found" });
    }

    res.status(200).json({
      uploadId,
      chunkCount: session.chunkCount,
      startTime: session.startTime,
      lastActivity: session.lastActivity,
      tempDir: session.tempDir,
      isActive: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching upload status", error });
  }
});

// =============================
// 8. CLEANUP OLD SESSIONS (Cron job)
// =============================
const cleanupOldSessions = () => {
  const now = new Date();
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      console.log(`🧹 Cleaning up stale session: ${uploadId}`);
      cleanupSession(session);
      uploadSessions.delete(uploadId);
    }
  }
};

// Run cleanup every 15 minutes
setInterval(cleanupOldSessions, 15 * 60 * 1000);

// =============================
// 9. ALTERNATIVE: Direct upload without temp files (for small chunks)
// =============================
router.post("/upload-chunk-direct", upload.single("chunk"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No chunk file provided" });
    }

    const { uploadId, chunkIndex, isFinal, userId } = req.body;

    // Convert buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    const dataUri = `data:video/webm;base64,${base64Data}`;

    // Upload options
    const uploadOptions = {
      resource_type: "video",
      public_id: uploadId,
      folder: "proctor_videos",
      tags: [`chunk_${chunkIndex}`],
    };

    // For non-first chunks, we need to handle merging differently
    if (parseInt(chunkIndex) > 0) {
      uploadOptions.type = 'upload';
    }

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    console.log(`✅ Chunk ${chunkIndex} uploaded directly to Cloudinary`);

    res.status(200).json({
      message: "Chunk uploaded successfully",
      chunkIndex,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("❌ Direct chunk upload error:", error);
    res.status(500).json({
      message: "Chunk upload failed",
      error: error.message,
    });
  }
});

// =============================
// 10. LEGACY ENDPOINT (Single file upload)
// =============================
router.post("/upload-proctor-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { userId, ExamId, courseId, isFinalExam } = req.body;

    // Create temp file
    const tempFilePath = path.join(os.tmpdir(), `video_${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        tempFilePath,
        {
          resource_type: "video",
          folder: "proctor_videos",
          eager: [{ width: 640, height: 480, crop: "limit" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Save to database
    if (isFinalExam === "true" || isFinalExam === true) {
      await User.findOneAndUpdate(
        { _id: userId, "ongoingCourses.courseId": courseId },
        { $set: { "ongoingCourses.$.finalExam.proctorVideoUrl": result.secure_url } }
      );
    } else {
      await ExamResult.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId), ExamId: new mongoose.Types.ObjectId(ExamId) },
        { proctorVideoUrl: result.secure_url }
      );
    }

    res.status(200).json({
      message: "Video uploaded",
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error("❌ Video upload failed:", error);
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
});

module.exports = router;