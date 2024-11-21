import React,{useState,useEffect,useRef} from 'react';
import { useParams, useLocation } from "react-router-dom";
import axios from 'axios'
const FinalExam = () => {
    const { userId ,courseId} = useParams(); 
    const [examData,setExamData]=useState(null);
    const [examResult,setExamResult]=useState(null);
  
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isExamSubmitted, setIsExamSubmitted] = useState(false)
    useEffect(()=>{
        const call=async()=>{
           const data=await axios.post('http://localhost:5000/learn/examData',{
            userId,courseId
           });
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
        
     
                        <div className='flex flex-row'>
                        {examData && examData.finalExam.questions.map((question, questionIndex) => (
                            <div>
                                {
                                    <p className={selectedOptions[questionIndex] && 'text-blue-600'} href={`#${questionIndex}`}>{questionIndex+1}</p>
                                }
                            </div>
                        ))}
                        </div>
                    
                        {examData && examData.finalExam.questions.map((question, questionIndex) => (
                            <div id={`${questionIndex}`} key={questionIndex} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                                <p className="text-lg text-gray-800 font-medium mb-4">{question.questionText}</p>
                                <div className="space-y-4">
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                name={`question-${questionIndex}`}
                                                value={option}
                                                checked={selectedOptions[questionIndex] === option}
                                                onChange={() => handleOptionChange(questionIndex, option)}
                                                className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-300"
                                            />
                                            <label className="text-sm text-gray-700">{option}</label>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => handleSubmitExam()}>Submit Quiz</button>
                            </div>
                        ))}
                   
            {
                examResult && (
                    <div>correct:
                  {
                    examResult.correct
                  }
                  <p>wrong: {examResult.wrong}</p>
                  <p>accuracy: {examResult.accuracy}</p>
                    </div>

                )
            }
         
    </>
  );
}

export default FinalExam;
