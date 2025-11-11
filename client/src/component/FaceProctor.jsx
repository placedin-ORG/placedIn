import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import API from "../utils/API";

const FaceProctor = forwardRef(({ onFlag, userId, ExamId }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastCenter = useRef(null);
  const mountedRef = useRef(true);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const lastViolation = useRef("");


  // === LIFECYCLE: Load models, init camera, start detection ===
  useEffect(() => {
    mountedRef.current = true;

    const loadAndStart = async () => {
      try {
        // ✅ Load face detection models
        if (
          !faceapi.nets.tinyFaceDetector.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded
        ) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          ]);
          console.log("✅ Face models loaded");
        }

        // 🎥 Start camera stream
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          toast.error("🚫 Unable to access camera: " + err.message);
          console.error("Camera access failed:", err);
          onFlag && onFlag("Camera access failed");
          return;
        }

        // Cancel setup if component unmounted early
        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;

        // Start recording
        startRecording(stream);

        // Wait until camera starts rendering
        await new Promise((resolve) => {
          const v = videoRef.current;
          const handlePlay = () => {
            v.removeEventListener("playing", handlePlay);
            resolve();
          };
          v.addEventListener("playing", handlePlay);
        });

        // Create hidden canvas for detection
        const video = videoRef.current;
        const canvas = faceapi.createCanvasFromMedia(video);
        canvas.style.display = "none";
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const container = document.getElementById("faceproctor-container");
        if (container) container.appendChild(canvas);
        canvasRef.current = canvas;

        // ✅ Start detection loop after short warm-up
        setTimeout(() => startDetectionLoop(), 2000);

      } catch (err) {
        console.error("FaceProctor init error:", err);
        toast.error("Camera or model load error.");
        onFlag && onFlag("Camera or model load error");
      }
    };

    loadAndStart();

    return () => {
      mountedRef.current = false;

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      cleanupCamera(); // stop camera fully

      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [onFlag]);

  // === CAMERA CLEANUP ===
  const cleanupCamera = () => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoElement.srcObject = null;
      console.log("🛑 Camera stream stopped — light turned off");
    }
  };

  // === START RECORDING ===
  const startRecording = (stream) => {
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 MediaRecorder stopped");
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    console.log("🎥 Recording started");
  };

  // === STOP RECORDING + UPLOAD + THEN STOP CAMERA ===
  const stopRecording = () => {
    console.log("🛑 stopRecording() triggered");

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.addEventListener(
        "stop",
        async () => {
          console.log("📤 Recording stopped — preparing upload...");
          const blob = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });

          try {
            // Upload first (keep camera light ON)
            await uploadVideo(blob);

            // ✅ Stop camera AFTER successful upload
            cleanupCamera();
            console.log("✅ Upload done — camera stopped.");
          } catch (error) {
            console.error("❌ Upload failed:", error);
            toast.error("Upload failed. Camera will now stop.");
            // Even if upload fails, release camera
            cleanupCamera();
          }

          mediaRecorderRef.current = null;
        },
        { once: true }
      );

      recorder.stop();
    } else {
      console.log("ℹ️ No active recorder found. Cleaning up camera...");
      cleanupCamera();
    }
  };

  // === VIDEO UPLOAD ===
  const uploadVideo = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("video", blob, `exam_${Date.now()}.webm`);
      formData.append("userId", userId);
      formData.append("ExamId", ExamId);

      const res = await API.post(
      "/proctor/upload-proctor-video",
      formData,
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // no timeout for large uploads
      }
    );

      if (res.status === 200) {
        toast.success("🎬 Proctor video uploaded successfully!");
        console.log("Uploaded video URL:", res.data.url);
      } else {
        toast.error("❌ Video upload failed");
        console.error(res.data);
      }
    } catch (err) {
      toast.error("Upload error: " + err.message);
      console.error("Video upload failed:", err);
      throw err;
    }
  };

  // === FACE DETECTION LOOP ===
 const startDetectionLoop = async () => {
  const detectionStartTime = Date.now();
  
   let lastDetectionTime = Date.now();

  // ✅ small debounce for multi-face to avoid false alerts on motion blur
  let multiFaceStreak = 0;

  const detectLoop = async () => {
    if (!mountedRef.current) return;

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

      // ✅ 1) De-duplicate overlapping/near-identical boxes (simple + fast)
      //    This prevents "multiple faces" when there's just one face moving.
      const dedup = [];
      for (const d of detections) {
        const bx = d.detection.box;
        const isDup = dedup.some((o) => {
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

      // === No Face Detected ===
      if (detections.length === 0) {
        multiFaceStreak = 0; // reset streak
        // Skip early 2s warmup
        if (currentTime - detectionStartTime > 2000) {
          if (lastViolation.current !== "No face detected") {
            onFlag && onFlag("No face detected");
            lastViolation.current = "No face detected";
          }
        }
        lastCenter.current = null;
      }

      // === Multiple Faces (with tiny debounce) ===
      else if (detections.length > 1) {
        multiFaceStreak += 1;
        if (multiFaceStreak >= 2) { // require 2 consecutive frames
          if (lastViolation.current !== "Multiple faces detected") {
            onFlag && onFlag("Multiple faces detected");
            toast.error("⚠️ Multiple faces detected!");
            lastViolation.current = "Multiple faces detected";
          }
        }
        lastCenter.current = null;
      }

      // === Single Face Detected ===
      else {
        multiFaceStreak = 0; // reset streak
        lastDetectionTime = currentTime;

        const d = detections[0];
        const { x, y, width, height } = d.detection.box;
        const center = { cx: x + width / 2, cy: y + height / 2 };

        // Movement threshold (10% of frame size for better responsiveness)
        const relX = video.videoWidth * 0.1;
        const relY = video.videoHeight * 0.1;

        if (lastCenter.current) {
          const dx = Math.abs(center.cx - lastCenter.current.cx);
          const dy = Math.abs(center.cy - lastCenter.current.cy);
          if ((dx > relX || dy > relY) && lastViolation.current !== "Face moved suddenly") {
            onFlag && onFlag("Face moved suddenly");
            toast.warning("⚠️ Face moved suddenly!");
            lastViolation.current = "Face moved suddenly";
          }
        }
        lastCenter.current = center;

        // === Head turn detection (stable, relative to eye distance) ===
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
            const deviation = Math.abs(noseTip.x - faceCenterX);
            const deviationRatio = deviation / eyeDistance;

            if (deviationRatio > 0.45 && lastViolation.current !== "Face turned away") {
              onFlag && onFlag("Face turned away from screen");
              toast.warning("⚠️ Face turned away from screen!");
              lastViolation.current = "Face turned away";
            }
          }
        }
      }
    } catch (err) {
      console.error("FaceProctor detection error:", err);
    }

    // ⚡ Run every frame for responsiveness
    requestAnimationFrame(detectLoop);
  };

  // 🔁 Start continuous detection loop
  requestAnimationFrame(detectLoop);
};


  // Expose stopRecording() to parent
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
        width="180"
        height="130"
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
