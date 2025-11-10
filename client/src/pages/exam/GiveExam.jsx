import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import ResultChart from '../component/ResultChart';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../component/Toast";
import Rating from "../../component/Rating";
import Footer from "../../component/Layout/Footer";
import API from "../../utils/API";
import parse from "html-react-parser";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import "react-quill/dist/quill.bubble.css";
import ExamResult from "./ExamResult";
import FaceProctor from "../../component/FaceProctor";

const GiveExam = () => {
  const navigate = useNavigate();
  const { userId, ExamId } = useParams();
  // const userId="67457ed3b6632562e2f2d60a";
  // const ExamId="6748776f11d6f5a4525824aa"
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [start, setStart] = useState(true);
  const [remainingTime, setRemainingTime] = useState(null);
  const [cond, setcond] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showProctor, setShowProctor] = useState(false);


  const finalConfirmation = () => {
    setShowModal(true); // Show the confirmation modal
  };
  // useEffect(() => {
  //   if (cond) {
  //     setStart(true);
  //   }
  // }, [cond]);

  const handleStart = () => {
    const elem = document.documentElement;
    setShowProctor(true);
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else {
      toast.error("Fullscreen not supported on your browser.");
    }
    setStart(false);
  };

  const handleCloseFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  const handleSubmitExam = useCallback(async (submitType) => {
    // If the exam is already being submitted, do nothing.
  if (isSubmittedRef.current) return;
  
  // Set the guard immediately
  isSubmittedRef.current = true;

    setShowModal(false);
    setIsExamSubmitted(true);
    if (submitType === "submit") {
      handleCloseFullscreen();
    }

    //console.log(selectedOptions);
    try {
      const finalAnswers = {
        objective: selectedOptionsRef.current,
        subjective: subjectiveAnswersRef.current,
      };
      const response = await API.post("/exam/submit-exam", {
        userId,
        ExamId,
        userAnswers: finalAnswers,
      });
      if (response.data.message === "Exam submitted successfully") {
        setExamData(null);
        setIsSubmit(true);
        //  setExamResult(data.data.updatedData)
        setRemainingTime(null);
      }
    } catch (err) {
      console.log(err);
    }
  }, [userId, ExamId, handleCloseFullscreen]);

  useEffect(() => {
    if (examData && !isExamSubmitted && !start) {
      const durationInMs = examData.duration * 60 * 1000;
      console.log(examData); // Convert duration to milliseconds
      const endTime = Date.now() + durationInMs; // Calculate end time

      const timer = setInterval(() => {
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
          clearInterval(timer);
          setRemainingTime(0);
          handleSubmitExam("auto"); // Automatically submit the exam
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000)); // Update remaining time in seconds
        }
      }, 1000);

      return () => clearInterval(timer); // Cleanup interval on unmount or examData changes
    }
  }, [examData, start, isExamSubmitted, handleSubmitExam]);

  useEffect(() => {
    const call = async () => {
      const data = await API.post("/exam/speceficExam", {
        ExamId,
        userId,
      });
      console.log(data.data.exam);
      if (data.data.msg === "exam found") {
        setExamData(data.data.exam);
        setcond(true);
      } else if (data.data.msg === "user found") {
        setIsSubmit(true);
        setShowModal(false);
      }
    };
    call();
  }, []);

  const handleOptionChange = (questionIndex, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
    setDoItLater((prevState) => ({
      ...prevState,
      [questionIndex]: false,
    }));
    console.log(selectedOptions);
  };

  const handleSubjectiveChange = (questionIndex, answer) => {
    setSubjectiveAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
    setDoItLater((prevState) => ({
      ...prevState,
      [questionIndex]: false,
    }));
  };

  const selectedOptionsRef = useRef(selectedOptions); // Ref to track selectedOptions
  const subjectiveAnswersRef = useRef(subjectiveAnswers); // Ref for subjectiveAnswers
  const isSubmittedRef = useRef(false);     

  // Sync the ref whenever subjectiveAnswers changes
  useEffect(() => {
    subjectiveAnswersRef.current = subjectiveAnswers;
  }, [subjectiveAnswers]);
  // Sync the ref whenever selectedOptions changes
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  useEffect(() => {
    if (!isExamSubmitted && !start) {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          console.log(
            "Exiting fullscreen. Current options:",
            selectedOptionsRef.current
          );
          toast.error("Exiting fullscreen mode make the exam auto submit");
          handleSubmitExam("auto");
        }
      };
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        toast.error("Reloading the page make the exam auto submit");
        handleSubmitExam("auto");
        return;
      };
      const handleWindowBlur = () => {
        toast.error("Leaving the page make the exam auto submit");
        handleSubmitExam("auto");
      };
      // Attach Event Listeners
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("blur", handleWindowBlur);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("blur", handleWindowBlur);
      };
    }
  }, [isExamSubmitted, start, handleSubmitExam]);

  const handleProctorFlag = useCallback((message) => {
    console.warn("⚠️ Proctor flag:", message);
    toast.warning(message);

    setViolationCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 3) {
        toast.error("❌ Too many violations! Your exam is being auto-submitted.");
        // Use the memoized handleSubmitExam
        setTimeout(() => handleSubmitExam("auto"), 2000); 
      }
      return newCount;
    });
  }, [handleSubmitExam]);

  const [doItLater, setDoItLater] = useState({});

  // Handle "Do It Later" click
  const handleDoItLaterClick = (questionIndex) => {
    setDoItLater((prevState) => ({
      ...prevState,
      [questionIndex]: !prevState[questionIndex] || false, // Properly toggles "Do It Later"
    }));
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    toast.warning('right click is prevented')
  };
  // const handleMouseDown = (e) => {
  //   if (e.button === 0) {
  //     e.preventDefault(); // Prevents left-click actions
  //     toast.warning('left click is prevented')
  //   }
  // };
  return (
    <>
      {/* Display remaining time */}
      <div className={`flex flex-col h-screen${
            isSubmit && "hidden"
          }`} onContextMenu={handleContextMenu}
          // onMouseDown={handleMouseDown}
          >

  {/* Remaining Time */}
  <Toast />

  {showProctor && !isExamSubmitted && (
  <FaceProctor
    onFlag={handleProctorFlag}
  />
)}
  {remainingTime !== null && (
    <div className="fixed top-0 left-0 right-0 h-12 bg-blue-600 text-white text-center py-2 z-50">
      <span className="text-lg font-semibold">
        ⏱️ Remaining Time: {Math.floor(remainingTime / 60)}:
        {String(remainingTime % 60).padStart(2, "0")}
      </span>
    </div>
  )}
{
  examData && (
    <>
    <div className="flex flex-grow overflow-hidden pt-12">
    {/* Navigation Bar */}
    <div className="w-1/4 bg-white border-r p-4 overflow-y-auto hidden sm:block">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {examData.questions.map((_, questionIndex) => (
          <a
            key={questionIndex}
            href={`#${questionIndex}`}
            className={`flex items-center justify-center p-4 rounded-lg text-primary transition-all duration-300 transform ${
              selectedOptions[questionIndex] ||
              subjectiveAnswers[questionIndex]
                ? "bg-green-600 text-white shadow-lg scale-110"
                : "bg-gray-100 hover:bg-gray-200 shadow-md hover:scale-105"
            } ${
              doItLater[questionIndex]
                ? "bg-orange-500 text-white"
                : ""
            } ${
              window.location.hash === `#${questionIndex}`
                ? "ring-4 ring-primary"
                : ""
            }`}
            aria-label={`Question ${questionIndex + 1}`}
            title={`Go to Question ${questionIndex + 1}`}
          >
            <span className="text-lg font-semibold">
              {questionIndex + 1}
            </span>
          </a>
        ))}
      </div>
    </div>

    {/* Questions Section */}
    <div className="flex-grow p-4 overflow-y-auto">
      {examData.questions.map((question, questionIndex) => (
        <div
          id={`${questionIndex}`}
          key={questionIndex}
          className="bg-white border border-gray-300 hover:shadow rounded-lg p-6 mb-6 transform transition-all duration-300 scroll-mt-12"
        >
          <div className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
            <span className="text-blue-500 font-bold">
              Q{questionIndex + 1}:
            </span>{" "}
            {parse(question.questionText)}
          </div>
          {question.type === "objective" ? (
            <div className="space-y-4">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:shadow-md transition-all"
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={optionIndex}
                    checked={
                      selectedOptions[questionIndex] === optionIndex
                    }
                    onChange={() =>
                      handleOptionChange(questionIndex, optionIndex)
                    }
                    className="form-radio w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-400"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <>
              <p className="text-base font-semibold text-primary mb-2">
                Answer:{" "}
              </p>
              <ReactQuill
    className="h-full text-xl"
    style={{ height: "10rem", maxHeight: "15rem" }}
    value={subjectiveAnswers[questionIndex] || ""}
    onChange={(v) => handleSubjectiveChange(questionIndex, v)}
    placeholder="Enter your Answer"
    modules={{
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "blockquote", "code-block"],
        ["clean"],
      ],
    }}
    formats={[
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "link",
      "blockquote",
      "code-block",
    ]}
    readOnly={false}
  />
            </>
          )}

          {/* "Do It Later" Button */}
          <button
            onClick={() => handleDoItLaterClick(questionIndex)}
            className={`mt-14 px-4 py-2 rounded-lg transition-all ${
              doItLater[questionIndex]
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {doItLater[questionIndex] ? "Unmark" : "Mark For Later"}
          </button>
        </div>
      ))}
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200"
      >
        Submit Exam
      </button>
    </div>
  </div>
    </>
  )
}
  
</div>

      {isSubmit && <ExamResult userId={userId} ExamId={ExamId} onContextMenu={handleContextMenu}/>}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onContextMenu={handleContextMenu}>
          <div className="bg-white rounded-lg p-6 w-[95%] relative shadow-xl">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">Confirm Start</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to submit the final exam?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500"
                onClick={() => handleSubmitExam("submit")}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {start && start && (
        <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50" onContextMenu={handleContextMenu}>
          <div className="bg-white rounded-lg p-6 w-[30%] relative shadow-xl">
            {/* Close Button */}

            <h2 className="text-xl font-semibold mb-4">Confirm Start</h2>
            <p className="text-gray-700 mb-6">confirm for full screen</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500"
                onClick={handleStart}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GiveExam;
