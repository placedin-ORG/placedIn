import React,{useState,useEffect,useRef} from 'react';
import { useParams, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import axios from 'axios';
import ResultChart from '../component/ResultChart'
const FinalExam = () => {
  const navigate=useNavigate();
    const { userId ,courseId} = useParams(); 
    const [examData,setExamData]=useState(null);
    const [examResult,setExamResult]=useState(null);
  
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isExamSubmitted, setIsExamSubmitted] = useState(false);
    const [showModal, setShowModal] = useState(false);

  const finalConfirmation = () => {
    setShowModal(true); // Show the confirmation modal
  };


    useEffect(()=>{
        const call=async()=>{
           const data=await axios.post('http://localhost:5000/learn/examData',{
            userId,courseId
           });
           console.log(data.data.updatedData)
           if(data.data.msg==='not found') {
           setExamData(data.data.course);
            }
            else if(data.data.msg==='found'){
              setExamResult(data.data.updatedData)
            }
        }
        call()
    
    },[])

    const handleOptionChange = (questionIndex, option) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [questionIndex]: option,
        }));
        console.log(selectedOptions)
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
          console.log("Exiting fullscreen. Current options:", selectedOptionsRef.current);
          alert("Exiting fullscreen mode is not allowed. Your exam will be submitted.");
          handleSubmitExam();
        }
      };

      // Attach Event Listeners
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      // Cleanup Event Listeners
      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
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


      const handleSubmitExam = async() => {
        setShowModal(false);
        setIsExamSubmitted(true);
        handleCloseFullscreen();
                console.log(selectedOptions)
        try{
  const data=await axios.post('http://localhost:5000/learn/examresult',{
        answers:selectedOptionsRef.current,
        userId,courseId
       })

       setExamData(null);
       setExamResult(data.data.updatedData)
        }catch(err){
            console.log(err);
        }
     
      };
  return (
    <>
        
     
        <div className="h-screen bg-gray-100 ">
          {
            examData && (
               <div className="max-w-4xl mx-auto">
    {/* Navigation Bar for Questions */}
    {
      examData && (
         <div className="fixed top-0 left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 z-50 flex flex-wrap justify-center fixed-navigation-bar ">
  {examData &&
    examData.finalExam.questions.map((_, questionIndex) => (
      <a
        key={questionIndex}
        href={`#${questionIndex}`}
        className={`w-10 h-10 flex items-center justify-center m-2 rounded-full text-white transition-all ${
          selectedOptions[questionIndex]
            ? "bg-green-600 hover:bg-green-700 shadow-md"
            : "bg-gray-300 hover:bg-gray-400"
        } ${
          window.location.hash === `#${questionIndex}` ? "ring-4 ring-blue-300" : ""
        }`}
        aria-label={`Question ${questionIndex + 1}`}
        title={`Question ${questionIndex + 1}`}
      >
        {questionIndex + 1}
      </a>
    ))}
</div>
      )
    }
   

    {/* Questions Section */}
    <div className="mt-32">
        {examData &&
      examData.finalExam.questions.map((question, questionIndex) => (
        <div
          id={`${questionIndex}`}
          key={questionIndex}
          className="bg-white shadow-lg rounded-lg p-6 mb-6 "
        >
          <p className="text-xl text-gray-800 font-semibold mb-6">
            Q{questionIndex + 1}. {question.questionText}
          </p>
          <div className="space-y-4">
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="flex items-center p-2 border border-gray-300 rounded-lg hover:shadow-lg"
              >
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option}
                  checked={selectedOptions[questionIndex] === option}
                  onChange={() => handleOptionChange(questionIndex, option)}
                  className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-300"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  

    {/* Submit Button */}
    <div className="text-center mt-8">
      <button
        onClick={finalConfirmation}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700"
      >
        Submit Exam
      </button>
    </div>
  </div>
            )
          }
 
{
  examResult && (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
  <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
    {/* Animated Title */}
    <h1 className="text-3xl font-bold text-blue-600 text-center mb-6 animate-fade-in">
      Exam Results
    </h1>

    {/* Result Details */}
    {examResult && (
      <div className="space-y-6">

        <div>
          <ResultChart data={examResult.dataPoints} currentUserAccuracy={examResult.accuracy}/>
        </div>
        {/* Correct Answers */}

        <div className="flex items-center justify-between p-4 bg-green-100 border-l-4 border-green-500 rounded-lg animate-slide-in">
          <p className="text-lg font-medium text-green-700">Correct Answers:</p>
          <p className="text-2xl font-bold text-green-700">{examResult.correct}</p>
        </div>

        {/* Wrong Answers */}
        <div className="flex items-center justify-between p-4 bg-red-100 border-l-4 border-red-500 rounded-lg animate-slide-in">
          <p className="text-lg font-medium text-red-700">Wrong Answers:</p>
          <p className="text-2xl font-bold text-red-700">{examResult.wrong}</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg animate-slide-in">
  <p className="text-lg font-medium text-yellow-700">Total Questions:</p>
  <p className="text-2xl font-bold text-yellow-700">{examResult.totalQuestions}</p>
</div>


        <div className="flex items-center justify-between p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg animate-slide-in">
          <p className="text-lg font-medium text-blue-700">Attempted:</p>
          <p className="text-2xl font-bold text-blue-700">{examResult.attempted}</p>
        </div>

        {/* Accuracy */}
        <div className="flex items-center justify-between p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg animate-slide-in">
          <p className="text-lg font-medium text-blue-700">Accuracy:</p>
          <p className="text-2xl font-bold text-blue-700">{examResult.accuracy}%</p>
        </div>
      </div>
    )}

    {/* Animated Button */}
    <div className="mt-8 text-center animate-fade-in">
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
      >
        Back to Dashboard
      </button>
    </div>
  </div> 
 
{
  examResult && (
    <div className="bg-white w-[70%] mt-5 p-4 rounded shadow-md mb-6 max-h-[400px] overflow-y-auto">
    <h2 className="text-xl font-bold mb-4">Final Exam Results</h2>
    {examResult.updatedcourse.finalExam.questions.map((question, index) => {
      const studentAnswer = examResult.updatedcourse.finalExam.result.answers[0][index.toString()];
      const correctAnswer = question.correctAnswer;
      const isCorrect = studentAnswer === correctAnswer;
  
      return (
        <div
          key={index}
          className={`p-4 border rounded mb-4 ${
            isCorrect ? "border-green-500" : "border-red-500"
          }`}
        >
          <h3 className="font-semibold">{index + 1}. {question.questionText}</h3>
          <div className="space-y-2 mt-2">
            {question.options.map((option) => (
              <div
                key={option}
                className={`p-2 rounded ${
                  option === correctAnswer
                    ? "bg-green-100"
                    : option === studentAnswer
                    ? "bg-red-100"
                    : ""
                }`}
              >
                {option}
                {option === correctAnswer && <FaCheckCircle className="inline ml-2 text-green-500" />}
                {option === studentAnswer && option !== correctAnswer && <FaTimesCircle className="inline ml-2 text-red-500" />}
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
  
  )
}

<div className='flex flex-col gap-3 w-[50%] h-72 mb-24'>
<h1 className='text-3xl font-semibold font-mono'>Certificate</h1>
<img className='w-full h-full' src='https://th.bing.com/th/id/OIP.rxDrB65ZGXpz6L5nE22ecAHaFP?w=249&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7'/>
<button className="text-base lg:text-xl text-white bg-red-500 w-fit px-8 lg:px-16 rounded-xl py-1.5 font-semibold" >
     Download Certificate
      </button>
</div>

</div>
  )
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
         
    </div>

   
    </>
  );
}

export default FinalExam;
