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

  useEffect(() => {
    mountedRef.current = true;
    hasStoppedRef.current = false;

    const loadAndStart = async () => {
      try {
        if (
          !faceapi.nets.tinyFaceDetector.isLoaded ||
          !faceapi.nets.faceLandmark68Net.isLoaded
        ) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          ]);
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        startRecording(stream);

        await new Promise(resolve => {
          videoRef.current.onplaying = () => resolve();
        });

        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvas.style.display = "none";
        document.getElementById("faceproctor-container")?.appendChild(canvas);
        canvasRef.current = canvas;

        setTimeout(() => startDetectionLoop(), 2000);
      } catch (err) {
        toast.error("Camera access denied");
        onFlag?.("Camera failed");
      }
    };

    loadAndStart();

    return () => {
      mountedRef.current = false;
      if (!hasStoppedRef.current) {
        hasStoppedRef.current = true;
        cleanupCameraOnly(); // on unmount (e.g. tab close)
      }
    };
  }, [onFlag]);

  // Stop camera + UI immediately
  const cleanupCameraOnly = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current?.parentNode) {
      canvasRef.current.parentNode.removeChild(canvasRef.current);
    }
    console.log("Camera OFF instantly");
  };

  const startRecording = (stream) => {
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    recorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  // Called when user clicks "Submit"
  const stopRecording = async () => {
    if (hasStoppedRef.current) return;
    hasStoppedRef.current = true;

    const recorder = mediaRecorderRef.current;

    // 1. Stop recording (this triggers onstop)
    if (recorder && recorder.state !== "inactive") {
      // Override onstop to upload in background
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

        // Upload in background (fire and forget)
        uploadVideoInBackground(blob);
      };

      recorder.stop();
    }

    // 2. Immediately turn off camera (user sees it's done)
    cleanupCameraOnly();

  };

  // Background upload — doesn't block anything
  const uploadVideoInBackground = async (blob) => {
    const formData = new FormData();
    formData.append("video", blob, `exam_${Date.now()}.webm`);
    formData.append("userId", userId);
    if (isFinalExam) {
      formData.append("courseId", courseId);
      formData.append("isFinalExam", true);
    } else {
      formData.append("ExamId", ExamId);
      formData.append("isFinalExam", false);
    }

    localStorage.setItem("uploadingVideo", "true");

    try {
      const res = await API.post("/proctor/upload-proctor-video", formData, {
        timeout: 0,
        maxBodyLength: Infinity,
      });

      toast.update("uploading", {
        render: "Proctor video uploaded successfully!",
        type: "success",
        autoClose: 5000,
      });

      if (!isFinalExam) {
        setTimeout(() => {
          try { window.close(); }
          catch { toast.info("You can now close this tab."); }
        }, 3000);
      }
    } catch (err) {
      toast.update("uploading", {
        render: "Upload failed (but exam submitted)",
        type: "error",
        autoClose: 8000,
      });
      console.error("Background upload failed:", err);
    } finally {
      setTimeout(() => localStorage.removeItem("uploadingVideo"), 1000);
    }
  };

  // Full detection loop — unchanged
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