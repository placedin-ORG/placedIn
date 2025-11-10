import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";

const FaceProctor = ({ onFlag }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastCenter = useRef(null);
  const mountedRef = useRef(true);
  const lastViolation = useRef("");
  const lastDetections = useRef(0); // for stability check

  useEffect(() => {
    mountedRef.current = true;

    const loadAndStart = async () => {
      try {
        // ✅ Load models only once
        if (
          !faceapi.nets.tinyFaceDetector.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded
        ) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          ]);
          console.log("✅ Face models loaded");
        } else {
          console.log("🟢 Models already loaded, skipping reload");
        }

        // 🎥 Start camera safely
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          if (err.name === "NotReadableError") {
            toast.error("⚠️ Camera already in use. Close other camera apps and refresh.");
          } else if (err.name === "NotAllowedError") {
            toast.error("🚫 Camera permission denied. Please allow and refresh.");
          } else {
            toast.error("Camera error: " + err.message);
          }
          console.error("Camera access failed:", err);
          onFlag && onFlag("Camera access failed");
          return;
        }

        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;

        // Wait for camera feed to start
        await new Promise((resolve) => {
          const v = videoRef.current;
          const handlePlay = () => {
            console.log("🎥 Video ready:", v.videoWidth, v.videoHeight);
            v.removeEventListener("playing", handlePlay);
            resolve();
          };
          v.addEventListener("playing", handlePlay);
        });

        // 🧩 Create invisible canvas (used for resizing)
        const video = videoRef.current;
        const canvas = faceapi.createCanvasFromMedia(video);
        canvas.style.display = "none"; // hide to prevent flicker
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const container = document.getElementById("faceproctor-container");
        if (container) container.appendChild(canvas);
        canvasRef.current = canvas;

        // 🕒 Wait 2 seconds before starting detection (avoid false startup alerts)
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
      // 🧹 Clean up
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      if (canvasRef.current?.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [onFlag]);

  // ✅ Detection Loop
  const startDetectionLoop = async () => {
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
          scoreThreshold: 0.4, // slightly higher to reduce noise
        });

        let detections = await faceapi
          .detectAllFaces(video, options)
          .withFaceLandmarks();

        // ✅ Filter overlapping boxes (same face detected twice)
        detections = detections.filter((d, i, arr) => {
          return !arr.some(
            (other, j) =>
              i !== j &&
              Math.abs(d.detection.box.x - other.detection.box.x) < 40 &&
              Math.abs(d.detection.box.y - other.detection.box.y) < 40
          );
        });

        // ✅ Skip one frame if detection count changed suddenly (stability)
        if (detections.length !== lastDetections.current) {
          lastDetections.current = detections.length;
          requestAnimationFrame(detectLoop);
          return;
        }

        // === CASE 1: No face detected ===
        if (detections.length === 0) {
          if (lastViolation.current !== "No face detected") {
            onFlag && onFlag("No face detected");
            toast.warning("No face detected!");
            lastViolation.current = "No face detected";
          }
          lastCenter.current = null;
        }

        // === CASE 2: Multiple faces detected ===
        else if (detections.length > 1) {
          if (lastViolation.current !== "Multiple faces detected") {
            onFlag && onFlag("Multiple faces detected");
            toast.error("⚠️ Multiple faces detected! Please ensure you're alone.");
            lastViolation.current = "Multiple faces detected";
          }
        }

        // === CASE 3: Movement or Head Turn ===
        else {
          const d = detections[0];
          const { x, y, width, height } = d.detection.box;
          const center = { cx: x + width / 2, cy: y + height / 2 };

          // Relaxed movement threshold (12%)
          const relX = video.videoWidth * 0.12;
          const relY = video.videoHeight * 0.12;

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

          // === Head turn detection ===
          const landmarks = d.landmarks;
          if (landmarks) {
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const nose = landmarks.getNose();
            if (leftEye.length && rightEye.length && nose.length > 3) {
              const avgEyeX = (leftEye[0].x + rightEye[rightEye.length - 1].x) / 2;
              const noseX = nose[3].x;
              const deviation = Math.abs(noseX - avgEyeX);
              const faceWidth = width;
              const deviationThreshold = faceWidth * 0.2; // more tolerant
              if (deviation > deviationThreshold && lastViolation.current !== "Face turned away") {
                onFlag && onFlag("Face turned away from screen");
                toast.warning("Face turned away from screen!");
                lastViolation.current = "Face turned away";
              }
            }
          }
        }
      } catch (err) {
        console.error("FaceProctor detection error:", err);
      }

      requestAnimationFrame(detectLoop);
    };

    requestAnimationFrame(detectLoop);
  };

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
          willChange: "transform",
          backfaceVisibility: "hidden",
          filter: "brightness(1.1) contrast(1.1)", // slightly improved clarity
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
};

export default FaceProctor;
