import React, { useEffect, useState, useRef } from "react";
import { FaAngleDown, FaAngleUp, FaLock, FaLockOpen } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { updateOnGoing } from "../redux/UserSlice";
import { persistor } from "../redux/store";
import Player from "@vimeo/player";
import Video from "../component/Video";
import Quiz from "../component/Quiz";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import FinalExam from "./FinalExam";
const CourseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [courseData, setCourseData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const { id } = useParams();
  const currentCourse = useSelector((state) => state.user.currentCourse);

  useEffect(() => {
    const call = async () => {
      const fetchedData = await axios.post(
        "http://localhost:5000/learn/fetchuser",
        {
          userId: currentCourse._id,
          courseId: id,
        }
      );
      const data = fetchedData.data.data.ongoingCourses;
      for (let i = 0; i < data.length; i++) {
        console.log(data[i].courseId);
        if (data[i].courseId === id) {
          setCourseData(data[i]);
          break;
        }
      }
    };
    call();
  }, []);
  const handleTopicClick = (topic, index, topics, chapterIndex) => {
    console.log({ topic, index, topics, chapterIndex });
    if (topic.isCurrent) {
      setSelectedTopic({
        topic: topic,
        index: index,
        topics: topics,
        chapterIndex: chapterIndex,
      });

      setSelectedQuiz(null);
    }
    // Clear quiz when a topic is selected
  };

  const handleQuizClick = (quiz,index) => {
    if (quiz.isCurrent) {
      setSelectedQuiz({
        questions:quiz.quizQuestions,
      chapterIndex:index
       });
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
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId =
        url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("drive.google.com")) {
      const fileId = url.split("d/")[1].split("/")[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url; // Return the URL as-is for other video platforms
  };

  const nextTopic = async () => {
    if (selectedTopic.index < selectedTopic.topics.length - 1) {
      const updatedData = await axios.post(
        "http://localhost:5000/learn/updateUser",
        {
          selectedTopic,
          userId: currentCourse._id,
          courseId: id,
        }
      );

      console.log(updatedData.data);
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
      const chapter = course.chapters[selectedTopic.chapterIndex];
      if (!chapter) return;
      setSelectedTopic({
        topic: chapter.topics[selectedTopic.index + 1],
        index: selectedTopic.index + 1,
        chapterIndex: selectedTopic.chapterIndex,
        topics: chapter.topics,
      });
    } else {
      const updatedData = await axios.post(
        "http://localhost:5000/learn/openquiz",
        {
          selectedTopic,
          userId: currentCourse._id,
          courseId: id,
        }
      );

      console.log(updatedData.data);
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
      const chapter = course.chapters[selectedTopic.chapterIndex];
      if (!chapter) return;
      setSelectedTopic(null);
      setSelectedQuiz({
        questions: chapter.quiz.quizQuestions,
        chapterIndex: selectedTopic.chapterIndex,
      });
    }
  };

  const openNextChapter = async (chapterIndex) => {
    if (chapterIndex < courseData.chapters.length - 1) {
      const updatedData = await axios.post(
        "http://localhost:5000/learn/openNextChapter",
        {
          chapterIndex: chapterIndex + 1,
          userId: currentCourse._id,
          courseId: id,
        }
      );
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
      const chapter = course.chapters[chapterIndex + 1];
      setSelectedTopic({
        topic: chapter.topics[0],
        index: 0,
        chapterIndex: chapterIndex + 1,
        topics: chapter.topics,
      });
      setSelectedQuiz(null);
    } else {
      const updatedData = await axios.post(
        "http://localhost:5000/learn/openFinalExam",
        {
          userId: currentCourse._id,
          courseId: id,
        }
      );
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
    }
  };
  const clear = () => {
    persistor.purge();
  };

  const handleFinalExam = async () => {
    try {
      const userId = currentCourse._id;
      console.log(courseData);
      if (courseData.finalExam.isCompleted) {
        navigate(`/finalExam/${userId}/${courseData.courseId}`);
      } else {
        navigate(`/finalExam-Instruction/${userId}/${courseData.courseId}`);
      }
    } catch (err) {
      console.log(err);
    }
  };
let totalTopics=0;
let completedTopics=0;
let progressPercentage=0;
if(courseData !==null){
  totalTopics = courseData.chapters.reduce((total, chapter) => {
    return total + chapter.topics.length;
  }, 0);

   completedTopics = courseData.chapters.reduce((total, chapter) => {
    return (
      total +
      chapter.topics.filter((topic) => topic.isCurrent).length
    );
  }, 0);

  // Calculate progress percentage
   progressPercentage = totalTopics
    ? Math.round((completedTopics / (totalTopics)) * 100)
    : 0;
}
   
  return (
    <>
      {/* <button onClick={()=>clear()}>clear</button> */}
      <Navbar />

      {courseData && (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Top Section - Course Title and Description */}

          <div className="flex relative">
            {/* Left Section (Sticky) */}
            <div className="w-1/4 bg-white p-6 shadow-md rounded-lg sticky top-20 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
  <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-gray-900">Course Content</h2>
  {courseData.chapters.map((chapter, chapterIndex) => (
    <div key={chapterIndex} className="mb-6">
      {/* Chapter Header */}
      <div className="flex justify-between items-center mb-2 cursor-pointer"  onClick={() => toggleChapter(chapterIndex)}>
        <h3 className="text-lg font-medium text-gray-800">{chapter.title}</h3>
        <button
          onClick={() => toggleChapter(chapterIndex)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          {expandedChapter === chapterIndex ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

      {/* Chapter Topics */}
      {expandedChapter === chapterIndex && (
        <div className="pl-4 mt-2">
          {chapter.topics.map((topic, topicIndex) => (
            <div
              key={topicIndex}
              className={`cursor-pointer mb-3 p-2 rounded-md transition-all ${
                selectedTopic && selectedTopic.topic.name === topic.name
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleTopicClick(topic, topicIndex, chapter.topics, chapterIndex)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {topic.name} {topic.isCurrent ? <FaLockOpen /> : <FaLock />}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopicContent(topicIndex);
                  }}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {expandedTopic === topicIndex ? <FaAngleUp /> : <FaAngleDown />}
                </button>
              </div>
              {expandedTopic === topicIndex && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {topic.content.length > 150
                    ? `${topic.content.substring(0, 150)}...`
                    : topic.content}
                  {topic.content.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopicContent(topicIndex);
                      }}
                      className="text-blue-600 ml-2 focus:outline-none"
                    >
                      {expandedTopic === topicIndex ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </p>
              )}
            </div>
          ))}

          {/* Quiz Button */}
          <div className="mt-4">
            <button
              onClick={() => handleQuizClick(chapter.quiz.quizQuestions)}
              className={`text-sm font-medium px-4 py-2 rounded-md ${
                chapter.quiz.isCurrent
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!chapter.quiz.isCurrent}
            >
              {chapter.quiz.isCurrent ? 'View Quiz' : 'Locked'}
            </button>
          </div>
        </div>
      )}
    </div>
  ))}

  {/* Final Exam Section */}
  {courseData.finalExam.isCurrent && (
    <div className="mt-6 border-t pt-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Final Exam</h2>
      <button
        onClick={() => handleFinalExam()}
        className="text-sm font-medium px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
      >
        Start Final Exam
      </button>
    </div>
  )}
</div>


            {/* Right Section (Selected Topic Video & Content) */}
            <div className="w-3/4 pl-6 mt-20">
  {selectedTopic ? (
    <div>
      {/* Topic Header */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{selectedTopic.topic.name}</h3>
      
      {/* Video Section */}
      <div className="mb-6">
        <Video 
          videoUrl={getEmbedUrl(selectedTopic.topic.videoUrl)} 
          setIsVideoWatched={setIsVideoWatched} 
        />
      </div>

      {/* Next Topic Button */}
      <div className="mt-4 flex justify-start">
        <button
          onClick={() => nextTopic()}
          className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-all"
        >
          Next Topic
        </button>
      </div>
    </div>
  ) : selectedQuiz ? (
    <div className="mt-6">
      {/* Quiz Section */}
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Quiz</h3>
      <Quiz 
        selectedQuiz={selectedQuiz.questions} 
        chapterIndex={selectedQuiz.chapterIndex} 
        openNextChapter={openNextChapter} 
      />
    </div>
  ) : (
    <p className="text-gray-600 text-lg text-center mt-10">
      Select a topic to view its content and video, or take the quiz.
    </p>
  )}
</div>

          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail;
