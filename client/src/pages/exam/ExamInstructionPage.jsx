import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ExamInstructionPage = () => {
  const navigate = useNavigate();
  const { userId, ExamId } = useParams();
  console.log(ExamId);
  const [showModal, setShowModal] = useState(false);
  // const location = useLocation();
  // const { id } = location.state
  const handleFinalExam = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const confirmStart = () => {
    setShowModal(false); // Close the modal
    try {
      const url = `${window.location.origin}/exam/${userId}/${ExamId}`;
      window.open(url, "_blank"); // Open the final exam in a new tab
      navigate(`/allExams`); // Navigate back to course details
    } catch (err) {
      console.log(err);
    }
  };

  // const handleFinalExam=async()=>{
  //     try{

  //       navigate(`/finalExam/${userId}/${courseId}`);
  //         const elem = document.documentElement;
  //       if (elem.requestFullscreen) {
  //         elem.requestFullscreen();
  //       } else if (elem.mozRequestFullScreen) {
  //         elem.mozRequestFullScreen();
  //       } else if (elem.webkitRequestFullscreen) {
  //         elem.webkitRequestFullscreen();
  //       } else if (elem.msRequestFullscreen) {
  //         elem.msRequestFullscreen();
  //       }
  //     }catch(err){
  //       console.log(err);
  //     }
  //   }
  return (
    <>
      <div className="w-full h-screen bg-slate-100 flex items-center justify-center p-6 md:p-12">
        {/* Outer Container */}
        <div className="flex flex-col md:flex-row items-center md:items-start w-full max-w-4xl border-2 rounded-3xl shadow-lg bg-white overflow-hidden">
          {/* Left Section - Instructions */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Instructions
            </h1>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <span className="text-red-500 font-medium">
                  Ensure you have watched the full course
                </span>{" "}
                and gained all necessary knowledge before proceeding.
              </li>
              <li>
                <span className="text-red-500 font-medium">
                  Do not exit full screen
                </span>
                . Exiting will cause the exam to automatically submit.
              </li>
              <li>
                Cheating is strictly prohibited. Maintain focus and integrity
                during the exam.
              </li>
            </ul>
            <button
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
              onClick={() => handleFinalExam()}
            >
              Start Exam
            </button>
          </div>

          {/* Right Section - Image */}
          <div className="w-full md:w-1/2 hidden md:flex items-center justify-center bg-gray-50">
            <img
              className="w-3/4 h-auto"
              src="https://openclipart.org/image/2400px/svg_to_png/170101/Cartoon-Robot.png"
              alt="Final Exam Robot"
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 md:p-8 w-[90%] max-w-md relative shadow-lg">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowModal(false)}
              aria-label="Close Modal"
            >
              ✖
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Confirm Start
            </h2>

            {/* Modal Content */}
            <p className="text-gray-600 mb-6">
              Are you sure you want to start the final exam? Once started, the
              timer will begin, and you cannot go back.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all"
                onClick={confirmStart}
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

export default ExamInstructionPage;
