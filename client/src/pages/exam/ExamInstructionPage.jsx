import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// Component to handle camera permission request and launch the exam
const ExamInstructionPage = () => {
  const navigate = useNavigate();
  const { userId, ExamId } = useParams();
  
  // State to control the confirmation/permission modal
  const [showModal, setShowModal] = useState(false);
  
  // State to hold the content of the modal (Pre-check or Permission Warning)
  const [modalContent, setModalContent] = useState('confirm'); 

  // --- UI Handler: Shows the initial modal ---
  const handleFinalExam = () => {
    // Reset to initial confirmation state
    setModalContent('confirm');
    setShowModal(true); 
  };
  
  // --- Core Logic: Checks camera and launches exam ---
  const checkCameraAndStart = async () => {
    setShowModal(true); 
    setModalContent('loading'); // Show loading state while asking for camera

    try {
      // 1. Attempt to get camera stream (triggers browser permission prompt)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false // Only request video for proctoring
      });

      // 2. If successful, stop the temporary stream and launch the exam
      stream.getTracks().forEach(track => track.stop());
      
      setModalContent('granted'); // Set success message
      
      // Add a small delay for user to see 'granted' message
      setTimeout(() => {
        // Launch Exam in a new tab (as per your original logic)
        const url = `${window.location.origin}/exam/${userId}/${ExamId}`;
        window.open(url, "_blank"); 
        
        setShowModal(false); 
        navigate(`/allExams`); 
      }, 1500);


    } catch (err) {
      // 3. If access is denied or blocked
      console.error("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setModalContent('denied');
      } else {
        setModalContent('error');
      }
    }
  };

  // --- Modal Content Renderer ---
  const renderModalContent = () => {
    switch (modalContent) {
      case 'confirm':
        return (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confirm Start</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to start the final exam? **Camera access is mandatory** for proctoring. By clicking 'Start Exam', you grant camera permission.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all"
                onClick={checkCameraAndStart}
              >
                Start Exam
              </button>
            </div>
          </>
        );
      case 'loading':
        return (
          <div className="text-center py-6">
            <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-700 font-medium">Requesting Camera Permission...</p>
            <p className="text-sm text-gray-500 mt-2">Please click **Allow** in the browser prompt.</p>
          </div>
        );
      case 'denied':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Permission Denied 🚫</h2>
            <p className="text-gray-700 mb-4">
              Camera access was denied. You **must** enable your camera for proctoring to start the exam.
            </p>
            <p className="text-sm text-gray-500 mb-6 bg-gray-100 p-3 rounded text-left">
                **Fix:** If the prompt doesn't appear when you click retry, click the **🔒 lock icon** in the URL bar and manually set the camera permission to **Allow** before retrying.
            </p>
            <button
              className="px-5 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all"
              onClick={checkCameraAndStart} // Retries the camera check
            >
              Retry Camera Check
            </button>
          </div>
        );
      case 'granted':
        return (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Access Granted ✅</h2>
            <p className="text-gray-700 font-medium">Launching Exam...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Camera Error</h2>
            <p className="text-gray-700 mb-4">
              An unexpected camera error occurred. Please ensure no other application is using your camera.
            </p>
            <button
              className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full h-screen bg-slate-100 flex items-center justify-center p-6 md:p-12">
        {/* ... (Existing Exam Instructions UI) ... */}
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
              <li>
                <span className="text-blue-500 font-medium">
                  Camera Access is Required
                </span>. Your video stream will be recorded for proctoring.
              </li>
            </ul>
            <button
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
              onClick={handleFinalExam}
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
            {/* Close Button only for confirmation/error states */}
            {(modalContent === 'confirm' || modalContent === 'denied' || modalContent === 'error') && (
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowModal(false)}
                aria-label="Close Modal"
              >
                ✖
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

export default ExamInstructionPage;