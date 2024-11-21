import React, { useEffect, useState,useRef } from 'react';
import { FaAngleDown, FaAngleUp,FaLock,FaLockOpen } from 'react-icons/fa';
import {useSelector,useDispatch} from "react-redux";
import {useParams} from 'react-router-dom'
import {updateOnGoing} from "../redux/UserSlice"
import { persistor } from '../redux/store';
import Player from '@vimeo/player';
import Video from '../component/Video';
import Quiz from '../component/Quiz';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '../component/Navbar'
import FinalExam from './FinalExam';
const CourseDetail = () => {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const [courseData, setCourseData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isVideoWatched, setIsVideoWatched] = useState(false);
const {id}=useParams();
const currentCourse=useSelector((state)=>state.user.currentCourse);

  useEffect(() => {
const call=async()=>{
 const fetchedData=await axios.post('http://localhost:5000/learn/fetchuser',{
  userId:currentCourse._id,
  courseId:id
 })
  const data=fetchedData.data.data.ongoingCourses;
    for(let i=0;i<data.length;i++){
      console.log(data[i].courseId)
      if(data[i].courseId===id){
        setCourseData(data[i]);
        break;
      }
    }
 
}
call();
   

  }, []);
  const handleTopicClick = (topic,index,topics,chapterIndex) => {
    console.log({topic,index,topics,chapterIndex})
    if(topic.isCurrent){
      setSelectedTopic({
        topic:topic,
        index:index,
        topics:topics,
      chapterIndex:chapterIndex});
     
    setSelectedQuiz(null); 
    }
    // Clear quiz when a topic is selected
  };

  const handleQuizClick = (quiz) => {
    if(quiz.isCurrent){
       setSelectedQuiz(quiz);
       setSelectedTopic(null); 
    }
   
   // Clear topic when a quiz is selected
  };

  const toggleChapter = (index) => {
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  const toggleTopicContent = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('drive.google.com')) {
      const fileId = url.split('d/')[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
     
    }
    return url; // Return the URL as-is for other video platforms
  };


  const nextTopic=async()=>{
 
  if(selectedTopic.index<selectedTopic.topics.length-1 ){
  const updatedData=await axios.post('http://localhost:5000/learn/updateUser',{
    selectedTopic,
    userId:currentCourse._id,
    courseId:id
  })
 
  console.log(updatedData.data);
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(course => course.courseId === id);
setCourseData(course)
  const chapter = course.chapters[selectedTopic.chapterIndex];
    if (!chapter) return;
setSelectedTopic({
        topic: chapter.topics[selectedTopic.index+1],
        index: selectedTopic.index+1,
        chapterIndex: selectedTopic.chapterIndex,
        topics: chapter.topics,
    });
  }else {
    const updatedData=await axios.post('http://localhost:5000/learn/openquiz',{
      selectedTopic,
      userId:currentCourse._id,
      courseId:id
    })
   
    console.log(updatedData.data);
        const course = updatedData.data.userAfterUpdate.ongoingCourses.find(course => course.courseId === id);
  setCourseData(course)
    const chapter = course.chapters[selectedTopic.chapterIndex];
      if (!chapter) return;
  setSelectedTopic(null);
   setSelectedQuiz({
      questions:chapter.quiz.quizQuestions,
      chapterIndex:selectedTopic.chapterIndex
    });
  }

}


const openNextChapter=async(chapterIndex)=>{

  if(chapterIndex<courseData.chapters.length-1){
  
    const updatedData=await axios.post('http://localhost:5000/learn/openNextChapter',{
      chapterIndex:chapterIndex+1,
      userId:currentCourse._id,
      courseId:id
    });
    const course = updatedData.data.userAfterUpdate.ongoingCourses.find(course => course.courseId === id);
    setCourseData(course);
    const chapter = course.chapters[chapterIndex+1];
    setSelectedTopic({
      topic: chapter.topics[0],
      index: 0,
      chapterIndex: chapterIndex+1,
      topics: chapter.topics,
    })
    setSelectedQuiz(null);
  }
  else{
    const updatedData=await axios.post('http://localhost:5000/learn/openFinalExam',{
       userId:currentCourse._id,
       courseId:id
    })
    const course = updatedData.data.userAfterUpdate.ongoingCourses.find(course => course.courseId === id);
    setCourseData(course);

  }
}
  const clear=()=>{
persistor.purge();
  }

  const handleFinalExam=async()=>{
    try{
      const userId=currentCourse._id;
console.log(courseData)
if(courseData.finalExam.isCompleted){
  navigate(`/finalExam/${userId}/${courseData.courseId}` );
}else{
      navigate(`/finalExam-Instruction/${userId}/${courseData.courseId}` );
}
  
    }catch(err){
      console.log(err);
    }
  }
  return (
    <>
    {/* <button onClick={()=>clear()}>clear</button> */}
    <Navbar/>
      {courseData && (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Top Section - Course Title and Description */}
     

          <div className="flex relative">
            {/* Left Section (Sticky) */}
            <div className="w-1/4 bg-white p-6 shadow-lg rounded-lg sticky top-20 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              {courseData.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">{chapter.title}</h3>
                    <button
                      onClick={() => toggleChapter(chapterIndex)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedChapter === chapterIndex ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                  </div>

                  {expandedChapter === chapterIndex && (
                    <div className="pl-4 mt-2">
                      {chapter.topics.map((topic, topicIndex) => (
                        <div
                          key={topicIndex}
                          className={`cursor-pointer mb-2 text-sm text-gray-700 hover:text-blue-600 ${selectedTopic &&selectedTopic.topic.name===topic.name ? 'bg-blue-500 text-white':'' }`}
                          onClick={() => handleTopicClick(topic,topicIndex,chapter.topics,chapterIndex,)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{topic.name} {topic.isCurrent ? <FaLockOpen/>:<FaLock/>}</span>
                            <button
                              onClick={() => toggleTopicContent(topicIndex)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {expandedTopic === topicIndex ? <FaAngleUp /> : <FaAngleDown />}
                            </button>
                          </div>

                          {expandedTopic === topicIndex && (
                            <p className="text-sm text-gray-600 mt-2">
                              {topic.content.length > 150
                                ? `${topic.content.substring(0, 150)}...`
                                : topic.content}
                              {topic.content.length > 150 && (
                                <button
                                  onClick={() => toggleTopicContent(topicIndex)}
                                  className="text-blue-600 ml-2"
                                >
                                  {expandedTopic === topicIndex ? 'Read Less' : 'Read More'}
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                      <div className="mt-4">
                        <button
                          onClick={() => handleQuizClick(chapter.quiz.quizQuestions)}
                          className="text-blue-600"
                        >
                          View Quiz 
                          {
                            chapter.quiz.isCurrent ? null : <FaLock/>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div>
                {
                  courseData.finalExam.isCurrent && (
                    <>
                    <h1 onClick={()=>handleFinalExam()}>Final Exam</h1>
                    </>
                  )
                }
              </div>
            </div>

            {/* Right Section (Selected Topic Video & Content) */}
            <div className="w-3/4 pl-6 mt-20">
              {selectedTopic ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">{selectedTopic.topic.name}</h3>
                  <div className="mb-6">
                    <Video videoUrl={getEmbedUrl(selectedTopic.topic.videoUrl) } setIsVideoWatched={setIsVideoWatched}/>
                    {/* <iframe
                      ref={iframeRef}
                      width="100%"
                      height="400"
                      src={getEmbedUrl(selectedTopic.topic.videoUrl)}
                      title={selectedTopic.topic.name}
                      className="rounded-lg shadow-lg"
                    ></iframe> */}
                    
                  </div>
                  <div> <button onClick={()=>nextTopic()}>Next Topic </button></div>
                </div>
              ) : selectedQuiz ? (
                <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quiz</h3>
                <Quiz selectedQuiz={selectedQuiz.questions} chapterIndex={selectedQuiz.chapterIndex} openNextChapter={openNextChapter}/>
                {/* {selectedQuiz.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                    <p className="text-lg text-gray-800 font-medium mb-4">{question.question}</p>
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
                  </div>
                ))} */}
              </div>
              
              ) : (
                <p className="text-gray-600">Select a topic to view its content and video or view the quiz.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail
