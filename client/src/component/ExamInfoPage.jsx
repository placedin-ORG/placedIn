import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ExamInfoPage = () => {
  const navigate = useNavigate();
  const { userId, courseId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const { id } = location.state;
  const handleFinalExam = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const confirmStart = () => {
    setShowModal(false); // Close the modal
    try {
      let url = `${
        import.meta.env.VITE_APP_CLIENT_URL
      }/finalExam/${userId}/${courseId}`;
      console.log("value of url" , url);
      window.open(url, "_blank"); // Open the final exam in a new tab
      navigate(`/courseDetail/${id}`); // Navigate back to course details
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
      <div className="flex flex-col md:flex-row items-center md:items-stretch w-full max-w-4xl rounded-3xl shadow-xl bg-white overflow-hidden">
        {/* Left Section - Instructions */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Final Exam Instructions
          </h1>
          <div className="mb-8">
            <div className="h-1 w-20 bg-orange-500 mb-6"></div>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>
                  <span className="font-semibold text-red-600">
                    Ensure you have watched the full course
                  </span>{" "}
                  and gained all necessary knowledge before proceeding.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>
                  <span className="font-semibold text-red-600">
                    Do not exit full screen
                  </span>
                  . Exiting will cause the exam to automatically submit.
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>
                  Cheating is strictly prohibited. Maintain focus and integrity
                  during the exam.
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <button
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md font-medium text-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              onClick={() => handleFinalExam()}
            >
              Start Exam
            </button>
          </div>
        </div>
          
        {/* Right Section - Image */}
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-10">
          <div className="w-full h-full flex items-center justify-center">
            <img
              className="w-4/5 h-auto drop-shadow-xl"
              src="https://openclipart.org/image/2400px/svg_to_png/170101/Cartoon-Robot.png"
              alt="Final Exam Robot"
            />
          </div>
        </div>
      </div>
    </div>
      
    {/* Confirmation Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-[90%] max-w-md relative shadow-2xl animate-fadeIn">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowModal(false)}
            aria-label="Close Modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
              
          {/* Modal Header */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Ready to Begin?
          </h2>
              
          {/* Divider */}
          <div className="h-px bg-gray-200 w-full mb-6"></div>
              
          {/* Modal Content */}
          <p className="text-gray-600 mb-8">
            Are you sure you want to start the final exam? Once started, the
            timer will begin, and you cannot go back.
          </p>
              
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              onClick={confirmStart}
            >
              Start Now
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default ExamInfoPage;
