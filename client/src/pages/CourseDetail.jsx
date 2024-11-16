import React, { useEffect, useState,useRef } from 'react';
import { FaAngleDown, FaAngleUp,FaLock,FaLockOpen } from 'react-icons/fa';
import {useSelector,useDispatch} from "react-redux";
import {useParams} from 'react-router-dom'
import {updateOnGoing} from "../redux/UserSlice"
import { persistor } from '../redux/store';
import Player from '@vimeo/player';
import Video from '../component/Video';
import Quiz from '../component/Quiz';
const CourseDetail = () => {
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
console.log(currentCourse)
// useEffect(() => {
//   const player = new Player(iframeRef.current);

//   player.on('loaded', () => {
//     player.getDuration().then((duration) => {
//       setVideoDuration(duration);
//     });
//   });

//   return () => {
//     player.off('loaded');
//   };
// }, [videoId]);
  useEffect(() => {
    console.log(id);
    console.log(currentCourse)
    const data=currentCourse.ongoingCourses;
    for(let i=0;i<data.length;i++){
      console.log(data[i].courseId)
      if(data[i].courseId===id){
        setCourseData(data[i]);
        break;
      }
    }
    // if (savedCourseData) {
    //   const parsedData = JSON.parse(savedCourseData);
    //   setCourseData(parsedData);
    // }
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

  const handleOptionChange = (questionIndex, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
    console.log(selectedOptions)
  };
const [state,setState]=useState(currentCourse);
  const nextTopic=async()=>{
    const updatedState = JSON.parse(JSON.stringify(state));
    
   if(selectedTopic.index<selectedTopic.topics.length-1 ){
    
        
    // Find the course by courseId
    const course = updatedState.ongoingCourses.find(course => course.courseId === id);
    if (!course) return; // Course not found

    // Get the chapter based on the chapter index
    const chapter = course.chapters[selectedTopic.chapterIndex];
    if (!chapter) return; // Chapter not found

    // Get the next topic based on the topic index
    const nextTopicIndex = selectedTopic.index + 1;
    const topic = chapter.topics[nextTopicIndex];
    if (!topic) return; // Topic not found

    // Update the isCurrent property of the topics
    chapter.topics = chapter.topics.map((t, index) => ({
      ...t,
      // Keep topics unlocked if already unlocked or set `isCurrent` for the next topic
      isCurrent: t.isCurrent || index <= nextTopicIndex,
    }));

    // Update the selected topic state
    setSelectedTopic({
        topic: chapter.topics[nextTopicIndex],
        index: nextTopicIndex,
        chapterIndex: selectedTopic.chapterIndex,
        topics: chapter.topics,
    });

    // Set the updated state
    dispatch(updateOnGoing({ updatedState }));
     console.log(updatedState)
     const data=updatedState.ongoingCourses;
     for(let i=0;i<data.length;i++){
       console.log(data[i].courseId)
       if(data[i].courseId===id){
         setCourseData(data[i]);
         break;
       }
     }
    // setCondition(!condition);
   }
   else if(selectedTopic.index===selectedTopic.topics.length-1 ){
    console.log(updatedState)
    const course = updatedState.ongoingCourses.find(course => course.courseId === id);
    if (!course) return; // Course not found

    // Get the chapter based on the chapter index
    const chapter = course.chapters[selectedTopic.chapterIndex];
    chapter.topics = chapter.topics.map((t, index) => ({
      ...t,
      // Keep topics unlocked if already unlocked or set `isCurrent` for the next topic
      isCurrent: t.isCurrent || index <= chapter.topics.length-1,
    }));
    // chapter.topics[selectedTopic.index].isCurrent = true;
    chapter.quiz.isCurrent=true;
    console.log(updatedState)
    if (!chapter) return;  
    dispatch(updateOnGoing({ updatedState }));
    console.log(updatedState)
    const data=updatedState.ongoingCourses;
    for(let i=0;i<data.length;i++){
      console.log(data[i].courseId)
      if(data[i].courseId===id){
        setCourseData(data[i]);
        break;
      }
    }

    setSelectedQuiz({
      questions:chapter.quiz.quizQuestions,
      questionIndex:selectedTopic.questionIndex
    });
    setSelectedTopic(null);
  }
}

const openNextChapter=(chapterIndex)=>{

  const updatedState = JSON.parse(JSON.stringify(state));
  const course = updatedState.ongoingCourses.find(course => course.courseId === id);
console.log(course);
  if(chapterIndex<course.chapters.length-1){
    console.log(chapterIndex );
    console.log(course.chapters.length-1)
    const chapter = course.chapters[chapterIndex];
    chapter.topics = chapter.topics.map((t, index) => ({
      ...t,
      // Keep topics unlocked if already unlocked or set `isCurrent` for the next topic
      isCurrent: t.isCurrent || index <= chapter.topics.length-1,
    }));
    course.chapters[chapterIndex+1].topics[0].isCurrent=true;
    console.log(updatedState)
    dispatch(updateOnGoing({ updatedState }));
    const data=updatedState.ongoingCourses;
    for(let i=0;i<data.length;i++){
      console.log(data[i].courseId)
      if(data[i].courseId===id){
        setCourseData(data[i]);
        break;
      }
    }
  }else{
    console.log("fw")
    const chapter = course.chapters[chapterIndex];
    chapter.topics = chapter.topics.map((t, index) => ({
      ...t,
      // Keep topics unlocked if already unlocked or set `isCurrent` for the next topic
      isCurrent: t.isCurrent || index <= chapter.topics.length-1,
    }));
  }
}
  const clear=()=>{
persistor.purge();
  }
  return (
    <>
    <button onClick={()=>clear()}>clear</button>
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
                    <h3 className="text-lg font-medium text-gray-800">{chapter.title} {chapter.isCurrent ? <FaLockOpen/>:<FaLock/>}</h3>
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
