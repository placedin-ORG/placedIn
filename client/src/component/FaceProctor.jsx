import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import API from "../utils/API";

const FaceProctor = forwardRef(({ onFlag, userId, ExamId, courseId, isFinalExam }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastCenter = useRef(null);
  const mountedRef = useRef(true);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const lastViolation = useRef("");
  const streamRef = useRef(null);
  const hasStoppedRef = useRef(false);

  // Cloudinary chunked upload state
  const uploadSessionIdRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const isUploadingRef = useRef(false);
  const uploadQueueRef = useRef([]);

  // === CONFIG ===
  const CONFIG = {
    CHUNK_DURATION: 5000, // 5 seconds per chunk
    MAX_RETRIES: 3,
  };

  useEffect(() => {
    mountedRef.current = true;
    hasStoppedRef.current = false;

    const loadAndStart = async () => {
      try {
        // Load face detection models
        if (
          !faceapi.nets.tinyFaceDetector.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded
        ) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          ]);
        }

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            frameRate: 15
          } 
        });
        
        if (!mountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        // Initialize Cloudinary upload session
        await initializeCloudinarySession();

        // Start chunked recording
        startChunkedRecording(stream);

        // Wait for video to play
        await new Promise(resolve => {
          videoRef.current.onplaying = () => resolve();
        });

        // Setup canvas for face detection
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvas.style.display = "none";
        document.getElementById("faceproctor-container")?.appendChild(canvas);
        canvasRef.current = canvas;

        // Start face detection
        setTimeout(() => startDetectionLoop(), 2000);

      } catch (err) {
        console.error("FaceProctor init error:", err);
        toast.error("Camera access denied");
        onFlag?.("Camera failed");
      }
    };

    loadAndStart();

    return () => {
      mountedRef.current = false;
      if (!hasStoppedRef.current) {
        hasStoppedRef.current = true;
        cleanupCameraOnly();
      }
    };
  }, [onFlag]);

  // === INITIALIZE CLOUDINARY UPLOAD SESSION ===
  const initializeCloudinarySession = async () => {
    try {
      const response = await API.post("/proctor/init-upload", {
        userId,
        ExamId: isFinalExam ? null : ExamId,
        courseId: isFinalExam ? courseId : null,
        isFinalExam,
      });

      if (response.data.uploadId) {
        uploadSessionIdRef.current = response.data.uploadId;
        localStorage.setItem("uploadingVideo", "true");
        console.log("✅ Cloudinary upload session initialized:", uploadSessionIdRef.current);
      } else {
        throw new Error("Failed to get upload ID");
      }
    } catch (error) {
      console.error("❌ Failed to initialize Cloudinary session:", error);
      throw error;
    }
  };

  // === CHUNKED RECORDING ===
  const startChunkedRecording = (stream) => {
    const options = {
      mimeType: 'video/webm; codecs=vp9,opus',
      videoBitsPerSecond: 300000, // 300 kbps for smaller chunks
    };

    let mediaRecorder;
    
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      // Fallback for browsers that don't support VP9
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorderRef.current = mediaRecorder;
    let chunks = [];
    let chunkStartTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
        
        // Every 5 seconds, upload the accumulated chunks
        if (Date.now() - chunkStartTime >= CONFIG.CHUNK_DURATION) {
          const chunkBlob = new Blob(chunks, { type: 'video/webm' });
          uploadChunkToCloudinary(chunkBlob, chunkIndexRef.current);
          
          // Reset for next chunk
          chunks = [];
          chunkIndexRef.current++;
          chunkStartTime = Date.now();
        }
      }
    };

    mediaRecorder.onstop = () => {
      // Upload final chunk if any remains
      if (chunks.length > 0) {
        const finalChunk = new Blob(chunks, { type: 'video/webm' });
        uploadChunkToCloudinary(finalChunk, chunkIndexRef.current, true);
      }
      console.log("🛑 Recording stopped");
    };

    // Start recording with 1-second timeslices
    mediaRecorder.start(1000);
    console.log("🎥 Chunked recording started (5s chunks)");
  };

  // === UPLOAD CHUNK TO CLOUDINARY ===
  // Update your FaceProctor component's uploadChunkToCloudinary function:

const uploadChunkToCloudinary = async (chunkBlob, chunkIndex, isFinal = false) => {
  if (!uploadSessionIdRef.current) {
    console.error("No upload session ID");
    return;
  }

  const formData = new FormData();
  formData.append("chunk", chunkBlob);
  formData.append("uploadId", uploadSessionIdRef.current);
  formData.append("chunkIndex", chunkIndex);
  formData.append("isFinal", isFinal.toString());
  formData.append("userId", userId);

  if (isFinalExam) {
    formData.append("courseId", courseId);
    formData.append("isFinalExam", "true");
  } else {
    formData.append("ExamId", ExamId);
    formData.append("isFinalExam", "false");
  }

  console.log(`📤 Uploading chunk ${chunkIndex} (${(chunkBlob.size / 1024).toFixed(1)}KB)`);

  try {
    const response = await API.post("/proctor/upload-chunk-simple", formData, {
      timeout: 30000, // 30 seconds for potentially larger uploads
    });

    if (response.status === 200) {
      console.log(`✅ Chunk ${chunkIndex} uploaded (${response.data.totalChunks} total)`);
      
      if (isFinal && response.data.videoUrl) {
        console.log("🎬 Final video URL:", response.data.videoUrl);
        
        // Store the video URL in local storage for the parent component
        localStorage.setItem(`proctorVideo_${userId}`, response.data.videoUrl);
      }
      if (isFinal && response.data.isComplete) {
        localStorage.removeItem("uploadingVideo");
      }
      return response.data;
    }
  } catch (error) {
    console.error(`❌ Failed to upload chunk ${chunkIndex}:`, error);
    
    // Retry logic
    const maxRetries = 3;
    for (let retry = 1; retry <= maxRetries; retry++) {
      try {
        console.log(`🔄 Retrying chunk ${chunkIndex} (attempt ${retry})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * retry));
        
        const retryResponse = await API.post("/proctor/upload-chunk-simple", formData, {
          timeout: 30000,
        });
        
        if (retryResponse.status === 200) {
          console.log(`✅ Chunk ${chunkIndex} uploaded on retry ${retry}`);
          return retryResponse.data;
        }
      } catch (retryError) {
        console.error(`❌ Retry ${retry} failed for chunk ${chunkIndex}:`, retryError);
      }
    }
    
    toast.warning("Video upload issues detected, but recording continues...");
  }
};

  // === STOP RECORDING (Called from parent) ===
  const stopRecording = async () => {
    if (hasStoppedRef.current) return;
    hasStoppedRef.current = true;

    // 1. Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // 2. Immediately turn off camera (user sees immediate feedback)
    cleanupCameraOnly();

    // 3. Finalize the upload session
    if (uploadSessionIdRef.current) {
      try {
        await API.post("/proctor/finalize-upload", {
          uploadId: uploadSessionIdRef.current,
          userId,
          isFinalExam,
          ...(isFinalExam ? { courseId } : { ExamId })
        });
        localStorage.removeItem("uploadingVideo");
        console.log("✅ Upload session finalized");
      } catch (error) {
        console.error("❌ Failed to finalize upload:", error);
      }
    }
  };

  // === IMMEDIATE CAMERA CLEANUP ===
  const cleanupCameraOnly = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current?.parentNode) {
      canvasRef.current.parentNode.removeChild(canvasRef.current);
    }
    console.log("📷 Camera OFF");
  };

  // === FACE DETECTION LOOP (Keep your existing code) ===
  const startDetectionLoop = () => {
    const detectionStartTime = Date.now();
    let lastDetectionTime = Date.now();
    let multiFaceStreak = 0;

    const detectLoop = async () => {
      if (!mountedRef.current || hasStoppedRef.current) return;

      try {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) {
          requestAnimationFrame(detectLoop);
          return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.4,
        });

        let detections = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks();

        // De-duplicate overlapping boxes
        const dedup = [];
        for (const d of detections) {
          const bx = d.detection.box;
          const isDup = dedup.some(o => {
            const bo = o.detection.box;
            return (
              Math.abs(bx.x - bo.x) < 40 &&
              Math.abs(bx.y - bo.y) < 40 &&
              Math.abs(bx.width - bo.width) < 40 &&
              Math.abs(bx.height - bo.height) < 40
            );
          });
          if (!isDup) dedup.push(d);
        }
        detections = dedup;

        const currentTime = Date.now();

        // No face
        if (detections.length === 0) {
          multiFaceStreak = 0;
          if (currentTime - detectionStartTime > 2000 && lastViolation.current !== "No face detected") {
            onFlag && onFlag("No face detected");
            lastViolation.current = "No face detected";
          }
          lastCenter.current = null;
        }
        // Multiple faces
        else if (detections.length > 1) {
          multiFaceStreak += 1;
          if (multiFaceStreak >= 2 && lastViolation.current !== "Multiple faces detected") {
            onFlag && onFlag("Multiple faces detected");
            toast.error("Multiple faces detected!");
            lastViolation.current = "Multiple faces detected";
          }
          lastCenter.current = null;
        }
        // Single face
        else {
          multiFaceStreak = 0;
          lastDetectionTime = currentTime;
          const d = detections[0];
          const { x, y, width, height } = d.detection.box;
          const center = { cx: x + width / 2, cy: y + height / 2 };

          // Sudden movement
          const relX = video.videoWidth * 0.1;
          const relY = video.videoHeight * 0.1;
          if (lastCenter.current) {
            const dx = Math.abs(center.cx - lastCenter.current.cx);
            const dy = Math.abs(center.cy - lastCenter.current.cy);
            if ((dx > relX || dy > relY) && lastViolation.current !== "Face moved suddenly") {
              onFlag && onFlag("Face moved suddenly");
              toast.warning("Face moved suddenly!");
              lastViolation.current = "Face moved suddenly";
            }
          }
          lastCenter.current = center;

          // Head turn detection
          const landmarks = d.landmarks;
          if (landmarks) {
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const nose = landmarks.getNose();

            if (leftEye.length && rightEye.length && nose.length > 3) {
              const leftEyeOuter = leftEye[0];
              const rightEyeOuter = rightEye[rightEye.length - 1];
              const eyeDistance = Math.abs(rightEyeOuter.x - leftEyeOuter.x);
              const noseTip = nose[3];
              const faceCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
              const deviationRatio = Math.abs(noseTip.x - faceCenterX) / eyeDistance;

              if (deviationRatio > 0.50 && lastViolation.current !== "Face turned away") {
                onFlag && onFlag("Face turned away from screen");
                toast.warning("Face turned away from screen!");
                lastViolation.current = "Face turned away";
              }
            }
          }
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      requestAnimationFrame(detectLoop);
    };

    requestAnimationFrame(detectLoop);
  };

  useImperativeHandle(ref, () => ({
    stopRecording,
  }));

  return (
    <div
      id="faceproctor-container"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: 180,
        height: 130,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #ddd",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          filter: "brightness(1.1) contrast(1.1)",
        }}
      />
      <p
        style={{
          fontSize: 11,
          color: "#fff",
          textAlign: "center",
          margin: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "4px 0",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        Camera active
      </p>
    </div>
  );
});

export default React.memo(FaceProctor);