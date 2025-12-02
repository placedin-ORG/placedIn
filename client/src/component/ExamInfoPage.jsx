import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// Define the states for the modal content
const MODAL_STATE = {
  CONFIRM: 'confirm',
  ASKING: 'asking',
  DENIED: 'denied',
  GRANTED: 'granted',
  ERROR: 'error',
};

const ExamInfoPage = () => {
  const navigate = useNavigate();
  const { userId, courseId } = useParams();
  const location = useLocation();
  const { id } = location.state;

  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState(MODAL_STATE.CONFIRM);

  const handleFinalExam = () => {
    setModalState(MODAL_STATE.CONFIRM);
    setShowModal(true); // Show the initial confirmation modal
  };

  const checkCameraAndLaunch = async () => {
    setModalState(MODAL_STATE.ASKING);
    setShowModal(true); // Keep modal open during permission check

    try {
      // 1. Request camera stream (triggers browser prompt)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // Assuming only video is needed for proctoring
      });

      // 2. Permission Granted: Stop temporary stream
      stream.getTracks().forEach((track) => track.stop());

      setModalState(MODAL_STATE.GRANTED);

      // 3. Launch exam after a small delay
      setTimeout(() => {
        const url = `${
          import.meta.env.VITE_APP_CLIENT_URL
        }/finalExam/${userId}/${courseId}`;
        console.log("value of url", url);
        window.open(url, "_blank"); // Open the final exam in a new tab
        
        setShowModal(false);
        navigate(`/courseDetail/${id}`); // Navigate back to course details
      }, 1000);

    } catch (err) {
      console.error("Camera access failure:", err);
      
      // 4. Permission Denied/Error
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setModalState(MODAL_STATE.DENIED);
      } else {
        setModalState(MODAL_STATE.ERROR);
      }
    }
  };

  // Helper function to render the dynamic modal content
  const renderModalContent = () => {
    switch (modalState) {
      case MODAL_STATE.CONFIRM:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Ready to Begin?
            </h2>
            <div className="h-px bg-gray-200 w-full mb-6"></div>
            <p className="text-gray-600 mb-6">
              Starting the final exam is irreversible. The timer begins immediately.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-8">
                <p className="text-sm font-medium text-yellow-800">
                    <span className="font-bold">⚠️ PROCTORING REQUIRED:</span> Camera access is **mandatory** to proceed with this exam.
                </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                onClick={checkCameraAndLaunch}
              >
                Start & Request Camera
              </button>
            </div>
          </>
        );

      case MODAL_STATE.ASKING:
        return (
          <div className="text-center py-6">
            <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Requesting Camera Access...</h2>
            <p className="text-gray-600">Please click **Allow** in the notification banner to proceed.</p>
          </div>
        );

      case MODAL_STATE.DENIED:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied 🚫</h2>
            <p className="text-gray-700 mb-4">
              Camera access was blocked by your browser. The exam cannot start without proctoring.
            </p>
            <div className="text-sm text-gray-500 mb-6 bg-red-50 p-3 rounded text-left">
                **To Fix:** Click the **🔒 lock icon** in the address bar and manually set Camera permission to **Allow**. Then click Retry.
            </div>
            <button
              className="px-5 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all"
              onClick={checkCameraAndLaunch} // Retries the camera check
            >
              Retry Camera Check
            </button>
          </div>
        );
      
      case MODAL_STATE.ERROR:
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Camera Error ❌</h2>
                <p className="text-gray-700 mb-4">
                    An unexpected error occurred. Please ensure your camera is connected and not being used by another app.
                </p>
                <button
                    className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                    onClick={() => setShowModal(false)}
                >
                    Close
                </button>
            </div>
        );

      case MODAL_STATE.GRANTED:
        return (
            <div className="text-center py-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">Access Granted ✅</h2>
                <p className="text-gray-700 font-medium">Launching Exam in new tab...</p>
            </div>
        );

      default:
        return null;
    }
  };

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
              <li className="flex items-start bg-blue-50 p-2 rounded-lg border border-blue-200">
                 <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.935a2 2 0 001.664-.89l1.62-2.73a.87.87 0 011.516 0l1.62 2.73a2 2 0 001.664.89H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 <span className="font-bold text-blue-800">Camera Access is Mandatory:</span> You will be prompted to allow camera access to start the exam.
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <button
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md font-medium text-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              onClick={handleFinalExam}
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
      
    {/* Dynamic Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 md:p-8 w-[90%] max-w-md relative shadow-2xl animate-fadeIn">
          
          {/* Close button visibility */}
          {(modalState === MODAL_STATE.CONFIRM || modalState === MODAL_STATE.DENIED || modalState === MODAL_STATE.ERROR) && (
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
          )}
          
          {/* Render dynamic content */}
          {renderModalContent()}
        </div>
      </div>
    )}
  </>
  );
};

export default ExamInfoPage;