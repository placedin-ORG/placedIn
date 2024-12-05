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
import API from "../utils/API";
import Disccussion from "../component/Disccussion";
import Rating from "../component/Rating";
import Footer from "../component/Layout/Footer";
import confetti from "canvas-confetti";
const CourseDetail = () => {
  const [celebrate, setCelebrate] = useState(false);
  const [discussion, setDiscussion] = useState(false);
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
  const currentCourse = useSelector((state) => state.user.user);
  console.log(currentCourse);

  useEffect(() => {
    const call = async () => {
      const fetchedData = await API.post("/learn/fetchuser", {
        userId: currentCourse._id,
        courseId: id,
      });
      const data = fetchedData.data.data.ongoingCourses;
      let latest = null;

      for (let i = 0; i < data.length; i++) {
        console.log(data[i].courseId);
        if (data[i].courseId === id) {
          if (data[i].finalExam.isCurrent) {
            doConfetii();
          }
          latest = data[i];
          setCourseData(data[i]);
          break;
        }
      }
      let result = null;
      latest.chapters.forEach((chapter, chapterIndex) => {
        chapter.topics.forEach((topic, topicIndex) => {
          if (topic.isCurrent) {
            result = {
              topic,
              index: topicIndex,
              topics: chapter.topics,
              chapterIndex,
            };
            setExpandedChapter(chapterIndex);
          }
        });
        // Breaks the chapter loop if the topic is found
      });
      setSelectedTopic(result);
    };
    call();
  }, []);

  const doConfetii = () => {
    fireConfetti();
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 600,
      spread: 350,
      origin: { y: 0.6 },
    });
  };
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

  const handleQuizClick = (quiz, index) => {
    if (quiz.isCurrent) {
      setSelectedQuiz({
        questions: quiz.quizQuestions,
        chapterIndex: index,
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
      const updatedData = await API.post("/learn/updateUser", {
        selectedTopic,
        userId: currentCourse._id,
        courseId: id,
      });

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
      const updatedData = await API.post("/learn/openquiz", {
        selectedTopic,
        userId: currentCourse._id,
        courseId: id,
      });

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
      const updatedData = await API.post("/learn/openNextChapter", {
        chapterIndex: chapterIndex + 1,
        userId: currentCourse._id,
        courseId: id,
      });
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
      const chapter = course.chapters[chapterIndex + 1];
      // setSelectedTopic({
      //   topic: chapter.topics[0],
      //   index: 0,
      //   chapterIndex: chapterIndex + 1,
      //   topics: chapter.topics,
      // });
      // setSelectedQuiz(null);
    } else {
      const updatedData = await API.post("/learn/openFinalExam", {
        userId: currentCourse._id,
        courseId: id,
        chapterIndex,
      });
      const course = updatedData.data.userAfterUpdate.ongoingCourses.find(
        (course) => course.courseId === id
      );
      setCourseData(course);
      if (!courseData.finalExam.isCurrent) {
        doConfetii();
      }
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
        navigate(`/finalExam-Instruction/${userId}/${courseData.courseId}`, {
          state: { id },
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  let progressPercentage = 0;
  if (courseData !== null) {
    const totalItems = courseData.chapters.reduce((sum, chapter) => {
      const topicsCount = chapter.topics.length;
      const quizCount = chapter.quiz ? 1 : 0;
      return sum + topicsCount + quizCount;
    }, 0);

    const completedItems = courseData.chapters.reduce((sum, chapter) => {
      const completedTopics = chapter.topics.filter(
        (topic) => topic.isCompleted
      ).length;
      const completedQuiz = chapter.quiz && chapter.quiz.isCompleted ? 1 : 0;
      return sum + completedTopics + completedQuiz;
    }, 0);

    progressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  }

  const getEmoji = (progress) => {
    if (progress === 0) return "😢"; // Sad face at 0%
    if (progress <= 25) return "😟"; // Slightly worried
    if (progress <= 50) return "😐"; // Neutral
    if (progress <= 75) return "🙂";
    // Smiling

    return "😁"; // Happy face at 100%
  };
  return (
    <>
      {/* <button onClick={()=>clear()}>clear</button> */}
      <Navbar />
      <div className="w-full flex justify-center py-4 bg-gray-100">
        <div className="flex space-x-6">
          {/* Course Tab */}
          <p
            className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
              !discussion
                ? "text-primary-light border-b-4 border-primary-dark pb-1"
                : "text-gray-600 hover:text-primary-dark"
            }`}
            onClick={() => setDiscussion(false)}
          >
            Course
          </p>
          {/* Discussion Tab */}
          <p
            className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
              discussion
                ? "text-primary-light border-b-4 border-primary-dark pb-1"
                : "text-gray-600 hover:text-primary-dark"
            }`}
            onClick={() => setDiscussion(true)}
          >
            Discussion
          </p>
        </div>
      </div>
      {!discussion ? (
        <div>
          {courseData && (
            <div className="p-6 bg-gray-50 min-h-9 flex flex-col items-center space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide mb-4">
                Course Progress
              </h1>

              {/* Progress Bar */}
              <div className="w-full max-w-4xl">
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-md">
                  {/* Filled Progress */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-light to-green-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                {/* Percentage Label */}
                <div className="flex justify-between mt-2 text-sm font-semibold text-gray-700">
                  <span>0%</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
              </div>

              {/* Emoji Display */}
              <div className="flex items-center space-x-4">
                <span
                  className={`text-4xl ${
                    progressPercentage >= 50 ? "animate-bounce" : ""
                  }`}
                >
                  {getEmoji(progressPercentage)}
                </span>
                <p className="text-lg font-semibold text-gray-700">
                  {progressPercentage === 100
                    ? "Congratulations! 🎉"
                    : "Keep going! You're doing great!"}
                </p>
              </div>
            </div>
          )}
          {courseData && (
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Top Section - Course Title and Description */}
              <div className="flex flex-col lg:flex-row relative container mx-auto p-4 lg:p-8">
                {/* Left Section (Sticky Sidebar for Course Content) */}
                <aside className="w-full lg:w-1/4 bg-white p-6 shadow-md rounded-lg lg:sticky top-6 h-fit lg:h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
                  <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-gray-900">
                    Course Content
                  </h2>
                  {courseData.chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className="mb-6">
                      {/* Chapter Header */}
                      <div
                        className="flex justify-between items-center mb-2 cursor-pointer group"
                        onClick={() => toggleChapter(chapterIndex)}
                      >
                        <h3 className="text-lg font-medium text-gray-800 group-hover:text-primary-dark">
                          {chapter.title}
                        </h3>
                        <button className="text-black hover:text-primary-dark focus:outline-none">
                          {expandedChapter === chapterIndex ? (
                            <FaAngleUp />
                          ) : (
                            <FaAngleDown />
                          )}
                        </button>
                      </div>

                      {/* Chapter Topics */}
                      {expandedChapter === chapterIndex && (
                        <div className="pl-4 mt-2">
                          {chapter.topics.map((topic, topicIndex) => (
                            <div
                              key={topicIndex}
                              className={`cursor-pointer mb-3 p-2 rounded-md transition-all ${
                                selectedTopic &&
                                selectedTopic.topic.name === topic.name
                                  ? "bg-primary-light text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                              onClick={() =>
                                handleTopicClick(
                                  topic,
                                  topicIndex,
                                  chapter.topics,
                                  chapterIndex
                                )
                              }
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm flex items-center gap-2">
                                  {topic.name}
                                  {topic.isCurrent ? (
                                    <FaLockOpen />
                                  ) : (
                                    <FaLock />
                                  )}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTopicContent(topicIndex);
                                  }}
                                  className="text-white  focus:outline-none"
                                >
                                  {expandedTopic === topicIndex ? (
                                    <FaAngleUp />
                                  ) : (
                                    <FaAngleDown />
                                  )}
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
                                      className="text-primary-light ml-2 focus:outline-none"
                                    >
                                      {expandedTopic === topicIndex
                                        ? "Read Less"
                                        : "Read More"}
                                    </button>
                                  )}
                                </p>
                              )}
                            </div>
                          ))}

                          {/* Quiz Button */}
                          <div className="mt-4">
                            <button
                              onClick={() =>
                                handleQuizClick(chapter.quiz, chapterIndex)
                              }
                              className={`text-sm font-medium px-4 py-2 rounded-md ${
                                chapter.quiz.isCurrent
                                  ? "bg-primary-light text-white hover:bg-primary-dark"
                                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
                              }`}
                              disabled={!chapter.quiz.isCurrent}
                            >
                              {chapter.quiz.isCurrent ? "View Quiz" : "Locked"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Final Exam Section */}
                  {courseData.finalExam.isCurrent && (
                    <div className="mt-6 border-t pt-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Final Exam
                      </h2>
                      <button
                        onClick={() => handleFinalExam()}
                        className="text-sm font-medium px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-dark transition-all"
                      >
                        {courseData.finalExam.isCompleted
                          ? "View Result"
                          : "Start Final Exam"}
                        {/* Start Final Exam */}
                      </button>
                    </div>
                  )}
                </aside>
                {/* Right Section (Selected Topic Video & Content) */}
                <div className="w-full lg:w-3/4 lg:pl-6 mt-10 lg:mt-0">
                  {selectedTopic ? (
                    <div>
                      {/* Topic Header */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {selectedTopic.topic.name}
                      </h3>

                      {/* Video Section */}
                      <div className="mb-8">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md">
                          <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(selectedTopic.topic.videoUrl)}
                            title={selectedTopic.topic.name}
                            allowFullScreen
                          />
                        </div>
                      </div>

                      {/* Next Topic Button */}
                      <div className="flex justify-start">
                        <button
                          onClick={() => nextTopic()}
                          className="px-6 py-3 bg-primary-dark text-white font-medium rounded-md hover:bg-primary-light transition-all shadow-md"
                        >
                          Next Topic
                        </button>
                      </div>
                    </div>
                  ) : selectedQuiz ? (
                    <div className="mt-10">
                      {/* Quiz Section */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Quiz
                      </h3>
                      <Quiz
                        selectedQuiz={selectedQuiz.questions}
                        chapterIndex={selectedQuiz.chapterIndex}
                        openNextChapter={openNextChapter}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-600 text-lg text-center mt-10">
                      Select a topic to view its content and video, or take the
                      quiz.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="p-6 bg-white shadow-lg rounded-lg mt-10 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Rate this Course
            </h2>
            <div className="flex items-center justify-center">
              <Rating courseId={id} userId={currentCourse?._id} />
            </div>
          </div>
        </div>
      ) : (
        <Disccussion
          courseId={id}
          userId={currentCourse._id}
          username={currentCourse.name}
        />
      )}
      <Footer />
    </>
  );
};

export default CourseDetail;
