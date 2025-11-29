import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaRegCircle,
  FaDotCircle,
  FaCalculator,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../utils/API";
import parse from "html-react-parser";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FaceProctor from "../../component/FaceProctor";
import Toast from "../../component/Toast";
import ExamResult from "./ExamResult";
import SimpleCalculator from "../../component/SimpleCalculator"; // Import our custom calculator
import FinalExamResult from "../courses/FinalExamResult";

// --- Constants for Question Status ---
const STATUS = {
  NOT_VISITED: "notVisited",
  NOT_ANSWERED: "notAnswered",
  ANSWERED: "answered",
  MARKED_FOR_REVIEW: "markedForReview",
  ANSWERED_AND_MARKED: "answeredAndMarked",
};

const GiveExam = () => {
  const navigate = useNavigate();
  const { userId, ExamId, courseId } = useParams();
  const isFinalExam = !!courseId;
  const [examData, setExamData] = useState(null);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [start, setStart] = useState(true);
  const [remainingTime, setRemainingTime] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [showProctor, setShowProctor] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // --- New State Management for Exam ---
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});

  const proctorRef = useRef(null);
  const isSubmittedRef = useRef(false);

  const selectedOptionsRef = useRef(selectedOptions);
  const subjectiveAnswersRef = useRef(subjectiveAnswers);
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);
  useEffect(() => {
    subjectiveAnswersRef.current = subjectiveAnswers;
  }, [subjectiveAnswers]);

  // --- Fetch Exam Data and Initialize States ---
  useEffect(() => {
    const call = async () => {
      try {
        let response;

        if (isFinalExam) {
          response = await API.post("/learn/final-exam", { userId, courseId });
        } else {
          response = await API.post("/exam/speceficExam", { ExamId, userId });
        }

        if (response.data.msg === "exam found") {
          setExamData({
            duration: isFinalExam ? response.data.exam.duration : response.data.exam.duration,
            questions: response.data.exam.questions,
          });

          const initialStatuses = {};
          response.data.exam.questions.forEach((_, index) => {
            initialStatuses[index] = STATUS.NOT_VISITED;
          });
          initialStatuses[0] = STATUS.NOT_ANSWERED;
          setQuestionStatuses(initialStatuses);

        } else if (response.data.msg === "user found") {
          setIsExamSubmitted(true);
        }

      } catch (err) {
        toast.error("Could not load exam.");
      }
    };

    call();
  }, []);


  // --- Fullscreen and Proctoring Logic ---
  const handleStart = () => {
    const elem = document.documentElement;
    setShowProctor(true);
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    else toast.error("Fullscreen not supported on your browser.");
    setStart(false);
  };

  const handleCloseFullscreen = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }, []);

  const handleSubmitExam = useCallback(
    async (submitType) => {
      if (isSubmittedRef.current) return;
      isSubmittedRef.current = true;

      setShowModal(false);

      if (submitType === "submit") {
        handleCloseFullscreen();
      }

      // Stop recording, which triggers the upload in FaceProctor
      if (proctorRef.current) {
        proctorRef.current.stopRecording();
      }

      try {
        const finalAnswers = {
          objective: selectedOptionsRef.current,
          subjective: subjectiveAnswersRef.current,
        };
        const url = isFinalExam ? "/learn/submit-final-exam" : "/exam/submit-exam";

        await API.post(url, {
          userId,
          courseId,
          ExamId,
          userAnswers: finalAnswers
        });

        // 2. Set state to render the ExamResult component
        setIsExamSubmitted(true);
      } catch (err) {
        console.log(err);
        toast.error("Failed to submit answers. Please contact support.");
        isSubmittedRef.current = false;
      }
    },
    [userId, ExamId, handleCloseFullscreen]
  );

  // --- Timer and Violation Handling ---
  useEffect(() => {
    if (examData && !isExamSubmitted && !start) {
      const durationInMs = examData.duration * 60 * 1000;
      const endTime = Date.now() + durationInMs;
      const timer = setInterval(() => {
        const timeLeft = endTime - Date.now();
        if (timeLeft <= 0) {
          clearInterval(timer);
          setRemainingTime(0);
          handleSubmitExam("auto");
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examData, start, isExamSubmitted, handleSubmitExam]);

  useEffect(() => {
    if (!isExamSubmitted && !start) {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          toast.error("Exiting fullscreen will auto-submit the exam.");
          handleSubmitExam("auto");
        }
      };
      window.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>
        window.removeEventListener("fullscreenchange", handleFullscreenChange);
    }
  }, [isExamSubmitted, start, handleSubmitExam]);

  const handleProctorFlag = useCallback(
    (message) => {
      console.warn("⚠️ Proctor flag:", message);
      toast.warning(message);
      setViolationCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5) {
          toast.error(
            "❌ Too many violations! Your exam is being auto-submitted."
          );
          setTimeout(() => handleSubmitExam("auto"), 3000);
        }
        return newCount;
      });
    },
    [handleSubmitExam]
  );

  // --- New Navigation and Action Handlers (omitted for brevity) ---
  const navigateToQuestion = (index) => {
    if (index >= 0 && index < examData.questions.length) {
      setCurrentQuestionIndex(index);
      if (questionStatuses[index] === STATUS.NOT_VISITED) {
        setQuestionStatuses((prev) => ({
          ...prev,
          [index]: STATUS.NOT_ANSWERED,
        }));
      }
    }
  };

  const handleAnswerChange = (index, answer) => {
    const isObjective = examData.questions[index].type === "objective";
    if (isObjective) {
      setSelectedOptions((prev) => ({ ...prev, [index]: answer }));
    } else {
      setSubjectiveAnswers((prev) => ({ ...prev, [index]: answer }));
    }
    setQuestionStatuses((prev) => ({
      ...prev,
      [index]:
        prev[index] === STATUS.MARKED_FOR_REVIEW ||
        prev[index] === STATUS.ANSWERED_AND_MARKED
          ? STATUS.ANSWERED_AND_MARKED
          : STATUS.ANSWERED,
    }));
  };

  const handleClearResponse = () => {
    const index = currentQuestionIndex;
    const isObjective = examData.questions[index].type === "objective";
    if (isObjective) {
      const newOptions = { ...selectedOptions };
      delete newOptions[index];
      setSelectedOptions(newOptions);
    } else {
      const newAnswers = { ...subjectiveAnswers };
      delete newAnswers[index];
      setSubjectiveAnswers(newAnswers);
    }
    setQuestionStatuses((prev) => ({
      ...prev,
      [index]:
        prev[index] === STATUS.ANSWERED_AND_MARKED
          ? STATUS.MARKED_FOR_REVIEW
          : STATUS.NOT_ANSWERED,
    }));
  };

  const handleMarkForReview = () => {
    const index = currentQuestionIndex;
    setQuestionStatuses((prev) => {
      const currentStatus = prev[index];
      let newStatus;
      if (currentStatus === STATUS.ANSWERED) {
        newStatus = STATUS.ANSWERED_AND_MARKED;
      } else if (currentStatus === STATUS.ANSWERED_AND_MARKED) {
        newStatus = STATUS.ANSWERED;
      } else if (currentStatus === STATUS.MARKED_FOR_REVIEW) {
        newStatus = STATUS.NOT_ANSWERED;
      } else {
        newStatus = STATUS.MARKED_FOR_REVIEW;
      }
      return { ...prev, [index]: newStatus };
    });
  };

  const handleSaveAndNext = () => {
    navigateToQuestion(currentQuestionIndex + 1);
  };

  const handleSaveAndMark = () => {
    handleMarkForReview();
    navigateToQuestion(currentQuestionIndex + 1);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    toast.warning("Right-click is disabled during the exam.");
  };

  const Legend = () => (
    <div className="p-4 border-b mb-4 text-xs">
      <h3 className="font-bold mb-3 text-sm">Legend</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-md"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-md"></div>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded-md"></div>
          <span>Not Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-500 rounded-md"></div>
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-500 rounded-md flex justify-end items-start">
            <FaCheckCircle className="text-green-400 -mr-1 -mt-1" />
          </div>
          <span>Answered & Marked</span>
        </div>
      </div>
    </div>
  );

  const currentQuestion = examData?.questions[currentQuestionIndex];

  // 3. Conditionally render ExamResult if the exam has been submitted
  if (isExamSubmitted) {
    return isFinalExam ? <FinalExamResult /> : <ExamResult />;
  }


  return (
    <>
      {/* Render the calculator */}
      {showCalculator && (
        <div style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 1000 }}>
          <SimpleCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {start && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onContextMenu={handleContextMenu}
        >
          <div className="bg-white rounded-lg p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Exam Instructions</h2>
            <p className="text-gray-700 mb-3">
              Your camera will remain active for proctoring.
            </p>
            <p className="text-gray-700 mb-6">
              Avoid violations like looking away, multiple faces, or leaving
              your seat. Multiple violations will lead to automatic submission.
            </p>
            <button
              className="w-full px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-400"
              onClick={handleStart}
            >
              Start Exam
            </button>
          </div>
        </div>
      )}

      <div
        className="flex flex-col h-screen"
        onContextMenu={handleContextMenu}
      >
        <Toast />
        {showProctor && (
          <FaceProctor
            userId={userId}
            ExamId={isFinalExam ? null : ExamId}
            courseId={isFinalExam ? courseId : null}
            isFinalExam={isFinalExam}
            ref={proctorRef}
            onFlag={handleProctorFlag}
          />

        )}
        {remainingTime !== null && (
          <div className="relative flex items-center justify-center fixed top-0 left-0 right-0 h-12 bg-blue-600 text-white text-center py-2 z-50">
            <span className="text-lg font-semibold">
              ⏱️ Remaining Time: {Math.floor(remainingTime / 60)}:
              {String(remainingTime % 60).padStart(2, "0")}
            </span>
            {/* The toggle button remains the same */}
            <button
              onClick={() => setShowCalculator((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
              title="Toggle Calculator"
            >
              <FaCalculator size={20} />
            </button>
          </div>
        )}

        {examData && !start && (
          <div className="flex flex-grow overflow-hidden pt-12">
            <div className="w-1/4 bg-white border-r p-4 overflow-y-auto hidden sm:block">
              <Legend />
              <div className="grid grid-cols-4 gap-2">
                {examData.questions.map((_, index) => {
                  const status = questionStatuses[index];
                  let bgColor = "bg-gray-300";
                  if (status === STATUS.NOT_ANSWERED) bgColor = "bg-red-500";
                  if (status === STATUS.ANSWERED) bgColor = "bg-green-500";
                  if (status === STATUS.MARKED_FOR_REVIEW)
                    bgColor = "bg-purple-500";
                  if (status === STATUS.ANSWERED_AND_MARKED)
                    bgColor = "bg-purple-500";

                  return (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      className={`relative flex items-center justify-center p-3 rounded-lg text-white transition-all duration-300 transform hover:scale-105 ${bgColor} ${
                        currentQuestionIndex === index
                          ? "ring-4 ring-blue-500"
                          : ""
                      }`}
                    >
                      <span className="text-lg font-semibold">
                        {index + 1}
                      </span>
                      {status === STATUS.ANSWERED_AND_MARKED && (
                        <FaCheckCircle className="absolute top-0 right-0 text-green-400 -mr-1 -mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentQuestion && (
              <div className="flex-grow p-6 overflow-y-auto flex flex-col">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 flex-grow">
                  <div className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                    <span className="text-blue-500 font-bold">
                      Q{currentQuestionIndex + 1}:
                    </span>{" "}
                    {parse(currentQuestion.questionText)}
                  </div>
                  {currentQuestion.type === "objective" ? (
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={optionIndex}
                            checked={
                              selectedOptions[currentQuestionIndex] ===
                              optionIndex
                            }
                            onChange={() =>
                              handleAnswerChange(
                                currentQuestionIndex,
                                optionIndex
                              )
                            }
                            className="form-radio w-5 h-5 text-blue-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-base font-semibold text-primary mb-2">
                        Answer:
                      </p>
                      <ReactQuill
                        className="h-full text-xl"
                        style={{ height: "15rem" }}
                        value={subjectiveAnswers[currentQuestionIndex] || ""}
                        onChange={(v) =>
                          handleAnswerChange(currentQuestionIndex, v)
                        }
                        placeholder="Enter your Answer"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSaveAndNext}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg"
                    >
                      Save & Next
                    </button>
                    <button
                      onClick={handleSaveAndMark}
                      className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg"
                    >
                      Save & Mark for Review
                    </button>
                    <button
                      onClick={handleClearResponse}
                      className="px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg"
                    >
                      Clear Response
                    </button>
                  </div>
                  {/* Added margin-right to prevent overlap with proctor video */}
                  <div className="flex flex-wrap gap-2 mr-48">
                    <button
                      onClick={() =>
                        navigateToQuestion(currentQuestionIndex - 1)
                      }
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      &lt;&lt; Previous
                    </button>
                    <button
                      onClick={() =>
                        navigateToQuestion(currentQuestionIndex + 1)
                      }
                      disabled={
                        currentQuestionIndex ===
                        examData.questions.length - 1
                      }
                      className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                      Next &gt;&gt;
                    </button>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md relative shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Confirm Submission</h2>
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
    </>
  );
};

export default GiveExam;
