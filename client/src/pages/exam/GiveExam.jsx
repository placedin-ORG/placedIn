import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  const [start, setStart] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [cond, setcond] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const finalConfirmation = () => {
    setShowModal(true); // Show the confirmation modal
  };
  useEffect(() => {
    if (cond) {
      setStart(true);
    }
  }, [cond]);

  const handleStart = () => {
    const elem = document.documentElement;
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
          handleSubmitExam(); // Automatically submit the exam
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000)); // Update remaining time in seconds
        }
      }, 1000);

      return () => clearInterval(timer); // Cleanup interval on unmount or examData changes
    }
  }, [examData, start]);
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

  // Sync the ref whenever selectedOptions changes
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  useEffect(() => {
    if (!isExamSubmitted) {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          console.log(
            "Exiting fullscreen. Current options:",
            selectedOptionsRef.current
          );
          toast.error("Exiting fullscreen mode make the exam auto submit");
          handleSubmitExam();
        }
      };

      // Attach Event Listeners
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      // Cleanup Event Listeners
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }
  }, [isExamSubmitted]);
  const handleCloseFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleSubmitExam = async () => {
    setShowModal(false);
    setIsExamSubmitted(true);
    handleCloseFullscreen();
    console.log(selectedOptions);
    try {
      const finalAnswers = {
        objective: selectedOptions,
        subjective: subjectiveAnswers,
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
  };
  const [doItLater, setDoItLater] = useState({});

  // Handle "Do It Later" click
  const handleDoItLaterClick = (questionIndex) => {
    setDoItLater((prevState) => ({
      ...prevState,
      [questionIndex]: !prevState[questionIndex] || false, // Properly toggles "Do It Later"
    }));
  };
  return (
    <>
      {/* Display remaining time */}
      <div className="flex flex-col">
        {/* Remaining Time */}
        <Toast />

        {remainingTime !== null && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 z-50">
            <span className="text-lg font-semibold">
              ⏱️ Remaining Time: {Math.floor(remainingTime / 60)}:
              {String(remainingTime % 60).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`container mx-auto px-4 py-16 flex-grow ${
            isSubmit && "hidden"
          }`}
        >
          {examData && (
            <>
              {/* Navigation Bar */}
              <div
                className="fixed top-0 left-0 right-0 bg-white !mt-9 shadow-xl rounded-b-lg p-4 z-50 flex flex-col justify-start items-center max-w-4xl mx-auto overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div className="grid grid-cols-6 gap-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                  {examData.questions.map((_, questionIndex) => (
                    <a
                      key={questionIndex}
                      href={`#${questionIndex}`}
                      className={`w-full flex items-center justify-center p-4 rounded-lg text-white transition-all duration-300 transform ${
                        selectedOptions[questionIndex] ||
                        subjectiveAnswers[questionIndex]
                          ? "bg-green-600 shadow-lg scale-110"
                          : "bg-gray-400 hover:bg-gray-500 shadow-md hover:scale-105"
                      } ${doItLater[questionIndex] ? "bg-orange-500" : ""} ${
                        window.location.hash === `#${questionIndex}`
                          ? "ring-4 ring-blue-300"
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
              <div className="mt-32">
                {examData.questions.map((question, questionIndex) => (
                  <div
                    id={`${questionIndex}`}
                    key={questionIndex}
                    className="bg-white shadow-md rounded-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-lg scroll-mt-36"
                  >
                    <p className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                      <span className="text-blue-500 font-bold">
                        Q{questionIndex + 1}:
                      </span>{" "}
                      {question.questionText}
                    </p>
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
                              value={option}
                              checked={
                                selectedOptions[questionIndex] === option
                              }
                              onChange={() =>
                                handleOptionChange(questionIndex, option)
                              }
                              className="form-radio w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-400"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        rows="4"
                        value={subjectiveAnswers[questionIndex] || ""}
                        onChange={(e) =>
                          handleSubjectiveChange(questionIndex, e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Write your answer here..."
                      ></textarea>
                    )}

                    {/* "Do It Later" Button */}
                    <button
                      onClick={() => handleDoItLaterClick(questionIndex)}
                      className={`mt-4 px-4 py-2 rounded-lg transition-all ${
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
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200"
                >
                  Submit Exam
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isSubmit && (
        <div className="flex flex-col gap-5 min-h-screen grainy-light font-semibold justify-center items-center w-full h-full">
          <h1 className="text-center text-2xl text-primary capitalize">
            {" "}
            Your Exam is Submited, please wait for the result announcement.
          </h1>
          <p className="text-gray-600 text-xl">Thank You!</p>
        </div>
      )}

      {
        examResult && "your exam is submitted"
        //      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
        //   <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        //     {/* Animated Title */}
        //     <h1 className="text-3xl font-bold text-blue-600 text-center mb-6 animate-fade-in">
        //       Exam Results
        //     </h1>

        //     {/* Result Details */}
        //     {examResult && (
        //       <div className="space-y-6">

        //         <div>
        //           <ResultChart data={examResult.dataPoints} currentUserAccuracy={examResult.accuracy}/>
        //         </div>
        //         {/* Correct Answers */}

        //         <div className="flex items-center justify-between p-4 bg-green-100 border-l-4 border-green-500 rounded-lg animate-slide-in">
        //           <p className="text-lg font-medium text-green-700">Correct Answers:</p>
        //           <p className="text-2xl font-bold text-green-700">{examResult.correct}</p>
        //         </div>

        //         {/* Wrong Answers */}
        //         <div className="flex items-center justify-between p-4 bg-red-100 border-l-4 border-red-500 rounded-lg animate-slide-in">
        //           <p className="text-lg font-medium text-red-700">Wrong Answers:</p>
        //           <p className="text-2xl font-bold text-red-700">{examResult.wrong}</p>
        //         </div>

        //         <div className="flex items-center justify-between p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg animate-slide-in">
        //   <p className="text-lg font-medium text-yellow-700">Total Questions:</p>
        //   <p className="text-2xl font-bold text-yellow-700">{examResult.totalQuestions}</p>
        // </div>

        //         <div className="flex items-center justify-between p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg animate-slide-in">
        //           <p className="text-lg font-medium text-blue-700">Attempted:</p>
        //           <p className="text-2xl font-bold text-blue-700">{examResult.attempted}</p>
        //         </div>

        //         {/* Accuracy */}
        //         <div className="flex items-center justify-between p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg animate-slide-in">
        //           <p className="text-lg font-medium text-blue-700">Accuracy:</p>
        //           <p className="text-2xl font-bold text-blue-700">{examResult.accuracy}%</p>
        //         </div>
        //       </div>
        //     )}

        //     {/* Animated Button */}
        //     <div className="mt-8 text-center animate-fade-in">
        //       <button
        //         onClick={() => navigate("/")}
        //         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
        //       >
        //         Back to Dashboard
        //       </button>
        //     </div>
        //   </div>

        // {
        //   examResult && (
        //     <div className="bg-white w-[70%] mt-5 p-4 rounded shadow-md mb-6 max-h-[400px] overflow-y-auto">
        //     <h2 className="text-xl font-bold mb-4">Final Exam Results</h2>
        //     {examResult.updatedcourse.finalExam.questions.map((question, index) => {
        //       const studentAnswer = examResult.updatedcourse.finalExam.result.answers[0][index.toString()];
        //       const correctAnswer = question.correctAnswer;
        //       const isCorrect = studentAnswer === correctAnswer;

        //       return (
        //         <div
        //           key={index}
        //           className={`p-4 border rounded mb-4 ${
        //             isCorrect ? "border-green-500" : "border-red-500"
        //           }`}
        //         >
        //           <h3 className="font-semibold">{index + 1}. {question.questionText}</h3>
        //           <div className="space-y-2 mt-2">
        //             {question.options.map((option) => (
        //               <div
        //                 key={option}
        //                 className={`p-2 rounded ${
        //                   option === correctAnswer
        //                     ? "bg-green-100"
        //                     : option === studentAnswer
        //                     ? "bg-red-100"
        //                     : ""
        //                 }`}
        //               >
        //                 {option}
        //                 {option === correctAnswer && <FaCheckCircle className="inline ml-2 text-green-500" />}
        //                 {option === studentAnswer && option !== correctAnswer && <FaTimesCircle className="inline ml-2 text-red-500" />}
        //               </div>
        //             ))}
        //           </div>
        //         </div>
        //       );
        //     })}
        //   </div>

        //   )
        // }

        // <div className='flex flex-col gap-3 w-[50%] h-72 mb-24'>
        // <h1 className='text-3xl font-semibold font-mono'>Certificate</h1>
        // <img className='w-full h-full' src='https://th.bing.com/th/id/OIP.rxDrB65ZGXpz6L5nE22ecAHaFP?w=249&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7'/>
        // <button className="text-base lg:text-xl text-white bg-red-500 w-fit px-8 lg:px-16 rounded-xl py-1.5 font-semibold" >
        //      Download Certificate
        //       </button>
        // </div>

        // <div className="p-6 bg-white shadow-lg rounded-lg mt-10 max-w-md w-full">
        //     <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Rate this Course</h2>
        //     <div className="flex items-center justify-center">
        //       <Rating courseId={courseId} userId={userId} />
        //     </div>
        //   </div>
        // </div>
      }

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                onClick={handleSubmitExam}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {start && (
        <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[95%] relative shadow-xl">
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
