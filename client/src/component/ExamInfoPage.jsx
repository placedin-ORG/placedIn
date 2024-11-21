import React from 'react';
import { useParams, useLocation } from "react-router-dom";
import {useNavigate} from 'react-router-dom';

const ExamInfoPage = () => {
    const navigate=useNavigate();
    const { userId,courseId } = useParams(); 
    const handleFinalExam=async()=>{
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
        }
      }
  return (
    <div>
      <h1>Instrustions :</h1>
      <p className='text-red-500'>
           Make sure you watched the full course and gained all the knowledge . This is the final exam and cheating is strictly prohibited . 
           *)Dont exit the full screen
            Exiting the full screen will cause the  exam to automatically submition 

            
      </p><button onClick={()=>handleFinalExam()}>Start Course </button>
    </div>
  );
}

export default ExamInfoPage;
