import React,{useState } from 'react';
import { useParams, useLocation } from "react-router-dom";
import {useNavigate} from 'react-router-dom';

const ExamInfoPage = () => {
    const navigate=useNavigate();
    const { userId,courseId } = useParams(); 
    const [showModal, setShowModal] = useState(false);

  const handleFinalExam = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const confirmStart = () => {
    setShowModal(false); // Close the modal
    try{
        
      navigate(`/finalExam/${userId}/${courseId}`);
        const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }catch(err){
      console.log(err);
    }// Handle actual exam start logic here
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
    <div className='w-full h-screen  bg-slate-100 flex items-center justify-center p-10 md:p-20  '>
      <div className='flex w-fit h-full border-2 p-1 md:p-10 rounded-3xl shadow-lg bg-white '>
        <div className='w-full md:w-1/2 p-6 md:p-11 '>
          <h1 className='text-2xl mb-2'>Instrustions :</h1>
      <p className='text-red-500 font-mono'>
          * Make sure you watched the full course and gained all the knowledge . This is the final exam and cheating is strictly prohibited . 
           *)Dont exit the full screen
            Exiting the full screen will cause the  exam to automatically submition 

            
      </p><button className='p-1 md:p-2 bg-orange-400 px-4 md:px-5 text-white rounded-md mt-3' onClick={()=>handleFinalExam()}>Start Course </button></div>
      <div className='w-1/2 hidden md:block'>
        <img className='w-full h-full' src='https://openclipart.org/image/2400px/svg_to_png/170101/Cartoon-Robot.png'/>
      </div>
        
      
      </div>
      
      
    </div>

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
              Are you sure you want to start the final exam? Once started, the timer will begin, and you cannot go back.
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
}

export default ExamInfoPage;
