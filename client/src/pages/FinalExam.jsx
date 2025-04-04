import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ResultChart from "../component/ResultChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../component/Toast";
import Rating from "../component/Rating";
import Footer from "../component/Layout/Footer";
import CoinModel from "../component/CoinModel";
import API from "../utils/API";
import certificate from "../assets/placedIn.png";
import parse from "html-react-parser";
const FinalExam = () => {
  const navigate = useNavigate();
  const { userId, courseId } = useParams();
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [start, setStart] = useState(true);
  const [remainingTime, setRemainingTime] = useState(null);
  const [cond, setcond] = useState(false);
  const [username, setUsername] = useState("");

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

      const durationInMs = examData.examDuration * 60 * 1000;
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
      const data = await API.post("/learn/examData", {
        userId,
        courseId,
      });
      console.log(data.data.updatedData);
      if (data.data.msg === "not found") {
        setExamData(data.data.course);
        setcond(true);

      } else if (data.data.msg === "found") {
        setExamResult(data.data.updatedData);
        console.log(data.data.updatedData);
        setIsExamSubmitted(true);
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

  const selectedOptionsRef = useRef(selectedOptions); // Ref to track selectedOptions

  // Sync the ref whenever selectedOptions changes
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  useEffect(() => {
    if (!isExamSubmitted && !start) {
      console.log("innnnnnnnnnnn")
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          console.log(
            "Exiting fullscreen. Current options:",
            selectedOptionsRef.current
          );
          toast.error("Exiting fullscreen mode make the exam auto submit");
          handleSubmitExam(true);
        }
      };
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        toast.error("Reloading the page make the exam auto submit");
        handleSubmitExam(true);
        return;
      };
      const handleWindowBlur = () => {
        toast.error("Leaving the page make the exam auto submit");
        handleSubmitExam(true);
      };
      // Attach Event Listeners
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("blur", handleWindowBlur);
      // Cleanup Event Listeners
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("blur", handleWindowBlur);
      };
    }
  }, [isExamSubmitted, start]);


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

  const handleSubmitExam = async (autoSubmit) => {
    setShowModal(false);
    setIsExamSubmitted(true);
    if (!autoSubmit) {
      handleCloseFullscreen();
    }

    console.log(selectedOptions);
    try {
      const data = await API.post("/learn/examresult", {
        answers: selectedOptionsRef.current,
        userId,
        courseId,
      });
      setIsModalOpen(true);
      setExamData(null);
      setExamResult(data.data.updatedData);
      setRemainingTime(null);
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

  // const downloadCertificate=async()=>{
  //   try{
  //     const response = await API.post(
  //       "/certificate/certificate-download",
  //       { name: "karan rawat", course: "java" },
  //       { responseType: "blob" } // Ensure the response is treated as binary data
  //     );
  //     console.log("Response Content-Type:", response.headers["content-type"]);
  //     console.log("Response Data Length:", response.data.size);
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "certificate.pdf");
  //     document.body.appendChild(link);
  //     link.click();
  //     link.parentNode.removeChild(link);
  //   }catch(err){
  //     console.log(err.message);
  //   }
  // }

  const [certificteModel, setCertificateModel] = useState(false);
  const canvasRef = useRef(null);

  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  const handleGenerateCertificate = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load the template image
    const template = new Image();
    template.src = certificate; // Update the path to your template image
    if (
      !username &&
      !examResult.updatedcourse.finalExam.certificate.downloaded
    ) {
      toast.error("enter your name");
      return;
    }
    template.onload = () => {
      // Draw the template
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // Overlay text
      ctx.fillStyle = "#000000"; // Black text
      ctx.textAlign = "center";

      // Website name
      ctx.font = "24px Arial";
      ctx.fillText("placedin", canvas.width / 2, 100);

      // Title
      ctx.font = "30px Arial bold";
      ctx.fillText("Course Completion Certificate", canvas.width / 2, 200);

      // Name
      ctx.font = "28px Arial";
      if (examResult.updatedcourse.finalExam.certificate.downloaded) {
        ctx.fillText(
          `${examResult.updatedcourse.finalExam.certificate.name}`,
          canvas.width / 2,
          300
        );
      } else {
        ctx.fillText(`${name}`, canvas.width / 2, 300);
      }

      // Description
      ctx.font = "18px Arial";
      ctx.fillText(
        `Successfully completed the course ${examResult.updatedcourse.courseName}`,
        canvas.width / 2,
        350
      );

      // Signature
      ctx.font = "18px Arial";
      ctx.fillText("[Signature]", canvas.width - 100, canvas.height - 50);

      // Save to state
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "certificate.png";
      link.click();
      // handleDownload();
    }; // Save the generated certificate to state
    if (!examResult.updatedcourse.finalExam.certificate.downloaded) {
      await API.post("/certificate/update-certificate", {
        userId,
        courseId,
      });
      setCertificateModel(false);
      window.location.reload();
    }
  };

  const handleDownload = () => {
    if (!generatedCertificate) return;

    const link = document.createElement("a");
    link.href = generatedCertificate;
    link.download = "certificate.png";
    link.click();
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    toast.warning("right click is prevented");
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
    
      {examData && (
  <div
    className="bg-gray-50 flex flex-col min-h-screen"
    onContextMenu={handleContextMenu}
  >
    {/* Remaining Time */}
    <Toast />
    {remainingTime !== null && (
      <div className="fixed top-0 left-0 right-0 bg-blue-700 text-white text-center py-3 z-50 shadow-md">
        <span className="text-lg font-semibold flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Remaining Time: {Math.floor(remainingTime / 60)}:
          {String(remainingTime % 60).padStart(2, "0")}
        </span>
      </div>
    )}

    {/* Main Content */}
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 mt-12">
      {/* Navigation Bar */}
      <div className="w-full md:w-1/4 bg-white shadow-lg rounded-lg p-6 overflow-x-auto md:overflow-y-auto sticky top-20 md:max-h-screen z-10 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Questions</h2>
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {examData.finalExam.questions.map((_, questionIndex) => (
            <a
              key={questionIndex}
              href={`#${questionIndex}`}
              className={`flex items-center justify-center p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                selectedOptions[questionIndex]
                  ? "bg-green-600 shadow-md"
                  : doItLater[questionIndex]
                  ? "bg-orange-500 shadow-md"
                  : window.location.hash === `#${questionIndex}`
                  ? "bg-blue-600 shadow-md"
                  : "bg-gray-400 hover:bg-gray-500"
              } ${
                window.location.hash === `#${questionIndex}`
                  ? "ring-2 ring-blue-300"
                  : ""
              }`}
              aria-label={`Question ${questionIndex + 1}`}
              title={`${
                selectedOptions[questionIndex]
                  ? "Answered"
                  : doItLater[questionIndex]
                  ? "Marked for later"
                  : "Unanswered"
              } - Question ${questionIndex + 1}`}
            >
              {questionIndex + 1}
            </a>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-green-600"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-orange-500"></div>
              <span>Marked for review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-gray-400"></div>
              <span>Unanswered</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Answered: {Object.keys(selectedOptions).length}</span>
            <span>Total: {examData.finalExam.questions.length}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Questions Section */}
      <div className="w-full md:w-3/4 flex flex-col gap-6 md:mt-0">
        {examData.finalExam.questions.map((question, questionIndex) => (
          <div
            id={`${questionIndex}`}
            key={questionIndex}
            className={`bg-white shadow-md rounded-lg p-6 transform transition-all duration-300 hover:shadow-lg scroll-mt-36 border-l-4 ${
              selectedOptions[questionIndex]
                ? "border-green-500"
                : doItLater[questionIndex]
                ? "border-orange-500"
                : "border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                  {questionIndex + 1}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    question.level === "Easy"
                      ? "text-green-800 bg-green-100"
                      : question.level === "Medium"
                      ? "text-orange-800 bg-orange-100"
                      : "text-red-800 bg-red-100"
                  }`}
                >
                  {question.level}
                </span>
              </div>
              
              <button
                onClick={() => handleDoItLaterClick(questionIndex)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  doItLater[questionIndex]
                    ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {doItLater[questionIndex] ? "Unmark" : "Mark for review"}
              </button>
            </div>
            
            <div className="text-base font-medium text-gray-800 mb-5">
              {parse(question.questionText || "")}
            </div>
            
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`flex items-center gap-3 p-4 border rounded-lg hover:border-blue-300 transition-all cursor-pointer ${
                    selectedOptions[questionIndex] === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={option}
                    checked={selectedOptions[questionIndex] === option}
                    onChange={() => handleOptionChange(questionIndex, option)}
                    className="form-radio w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-200"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              {questionIndex > 0 && (
                <a
                  href={`#${questionIndex - 1}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5"></path>
                    <path d="M12 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </a>
              )}
              {questionIndex < examData.finalExam.questions.length - 1 && (
                <a
                  href={`#${questionIndex + 1}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium ml-auto"
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
        
        <button
          onClick={() => setShowModal(true)}
          className="mb-12 px-6 py-4 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200"
        >
          Submit Exam
        </button>
      </div>
    </div>
  </div>
)}


{examResult && (
  <div
    onContextMenu={handleContextMenu}
    className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4"
  >
    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl border border-gray-100">
      {/* Header with Score */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Exam Results
        </h1>
        <div className="inline-flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                className="text-gray-200" 
                strokeWidth="8" 
                stroke="currentColor" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-blue-600" 
                strokeWidth="8" 
                stroke="currentColor" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * examResult.accuracy / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{examResult.accuracy}%</span>
            </div>
          </div>
        </div>
        <p className="text-gray-500 mt-2">
          {examResult.accuracy >= 70 
            ? "Congratulations! You've passed the exam." 
            : "Keep practicing. You can improve!"}
        </p>
      </div>

      {/* Result Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow border border-l-4 border-l-green-500 border-gray-100">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Correct</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{examResult.correct}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-l-4 border-l-red-500 border-gray-100">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Incorrect</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{examResult.wrong}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-l-4 border-l-blue-500 border-gray-100">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Attempted</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{examResult.attempted}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border border-l-4 border-l-yellow-500 border-gray-100">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{examResult.totalQuestions}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </button>
        <button
          onClick={() => setCertificateModel(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Get Certificate
        </button>
      </div>
    </div>

    {/* Certificate Modal */}
    {certificteModel && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full relative shadow-2xl">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setCertificateModel(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Your Certificate</h2>
              <p className="text-gray-600 mt-1">Enter your name as you'd like it to appear</p>
            </div>

            {examResult.updatedcourse.finalExam.certificate.downloaded ? (
              <input
                type="text"
                id="nameInput"
                placeholder="John Doe"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                value={examResult.updatedcourse.finalExam.certificate.name}
                readOnly
              />
            ) : (
              <input
                type="text"
                id="nameInput"
                placeholder="John Doe"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              style={{ display: "none" }}
            ></canvas>

            {!examResult.updatedcourse.finalExam.certificate.downloaded ? (
              <button
                onClick={handleGenerateCertificate}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 font-medium"
              >
                Generate Certificate
              </button>
            ) : (
              <button
                id="downloadButton"
                onClick={handleDownload}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 mb-2 font-medium"
              >
                Download Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Detailed Results Section */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-4xl mt-8 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Question Analysis
        </h2>
      </div>
      
      <div className="max-h-96 overflow-y-auto p-4">
        {examResult.updatedcourse.finalExam.questions.map((question, index) => {
          const studentAnswer = 
            examResult.updatedcourse.finalExam.result.answers[0][index.toString()];
          const correctAnswer = question.correctAnswer;
          const isCorrect = studentAnswer === correctAnswer;

          return (
            <div
              key={index}
              className={`mb-6 border rounded-lg overflow-hidden ${
                isCorrect ? "border-green-200" : "border-red-200"
              }`}
            >
              <div className={`px-4 py-3 ${
                isCorrect ? "bg-green-50" : "bg-red-50"
              }`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {isCorrect ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-800">
                    {index + 1}. {parse(question.questionText || "")}
                  </h3>
                </div>
              </div>
              <div className="p-4 bg-white">
                {question.options.map((option) => (
                  <div
                    key={option}
                    className={`p-3 mb-2 rounded-md flex items-center ${
                      option === correctAnswer
                        ? "bg-green-100 border border-green-200"
                        : option === studentAnswer && option !== correctAnswer
                        ? "bg-red-100 border border-red-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <span className="flex-grow">{option}</span>
                    {option === correctAnswer && (
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {option === studentAnswer && option !== correctAnswer && (
                      <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Rating Section */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-2xl mt-8 mb-16 p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Rate this Course</h2>
        <p className="text-gray-600 mb-4">Your feedback helps us improve our content</p>
        <div className="flex items-center justify-center">
          <Rating courseId={courseId} userId={userId} />
        </div>
      </div>
    </div>

    {isModalOpen ? (
      <CoinModel setIsModalOpen={setIsModalOpen} type="result" />
    ) : null}
  </div>
)}

{showModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    onContextMenu={handleContextMenu}
  >
    <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 relative shadow-2xl animate-fadeIn">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => setShowModal(false)}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Submission</h2>
      
      {/* Divider */}
      <div className="h-px bg-gray-200 w-full mb-6"></div>
      
      {/* Content */}
      <p className="text-gray-600 mb-8">
        Are you sure you want to submit the final exam? This action cannot be undone.
      </p>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-5 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={() => handleSubmitExam(false)}
        >
          Submit Exam
        </button>
      </div>
    </div>
  </div>
)}
   {start && examData && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    onContextMenu={handleContextMenu}
  >
    <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 relative shadow-2xl animate-fadeIn">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Full Screen Mode</h2>
      
      {/* Divider */}
      <div className="h-px bg-gray-200 w-full mb-6"></div>
      
      {/* Content */}
      <p className="text-gray-600 mb-8">
        This exam requires full screen mode. Your session will begin immediately after confirmation.
      </p>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

export default FinalExam;
