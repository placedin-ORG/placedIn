import React, { useEffect, useState } from "react";
// --- I've added a Checkmark icon ---
import {
  FaAngleDown,
  FaAngleUp,
  FaLock,
  FaLockOpen,
  FaCheckCircle,
} from "react-icons/fa";
// ---
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateOnGoing, setCurrentCourse } from "../redux/UserSlice";
import { persistor } from "../redux/store";
import Video from "../component/Video";
import Quiz from "../component/Quiz";
import API from "../utils/API";
import Navbar from "../component/Navbar";
import Disccussion from "../component/Disccussion";
import Rating from "../component/Rating";
import Footer from "../component/Layout/Footer";
import confetti from "canvas-confetti";
import formatSecondsToHMS from "../utils/durationHelper";

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
  console.log(" value of currentb course", currentCourse);

  console.log("selected quiz", courseData);

  useEffect(() => {
    if (!currentCourse?._id) return;
    const reduxCourse = currentCourse?.ongoingCourses?.find(
      (course) => course.courseId === id
    );

    // if (reduxCourse) {
    //   setCourseData(reduxCourse);
    //   dispatch(setCurrentCourse({ course: reduxCourse }));
    //   console.log(" Loaded from Redux:", reduxCourse);
    //   return;
    // }

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
          console.log("fetched course data:", data[i]);
          setCourseData(data[i]);
          dispatch(setCurrentCourse({ course: data[i] }));
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
  }, [currentCourse, id]);

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
    console.log(" data of selected tpoic", {
      topic,
      index,
      topics,
      chapterIndex,
    });
    if (topic.isCurrent) {
      setSelectedTopic({
        topic: topic,
        index: index,
        topics: topics,
        chapterIndex: chapterIndex,
      });
      console.log("selected topic", selectedTopic),
        setSelectedQuiz(null);
    }
    // Clear quiz when a topic is selected
  };

  const handleQuizClick = (quiz, index) => {
    console.log("value of quiz", quiz);

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
      console.log("course data 2", courseData);
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
      console.log(" in final exam", courseData);
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
              <div className="flex flex-col lg:flex-row relative container mx-auto p-4 lg:p-8">
                <aside className="w-full lg:w-1/4 bg-white p-4 shadow-lg rounded-lg lg:sticky top-6 h-fit max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
                  <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-3 text-gray-800">
                    Course Content
                  </h2>
                  <div className="space-y-2">
                    {courseData.chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapterIndex}
                        className="border-b border-gray-200 last:border-b-0 pb-2"
                      >
                        {/* === Chapter Header === */}
                        <div
                          className="flex justify-between items-center p-2 cursor-pointer group"
                          onClick={() => toggleChapter(chapterIndex)}
                        >
                          <div className="flex flex-col">
                            <h3 className="text-md font-semibold text-gray-800 group-hover:text-primary-dark">
                              {chapter.title}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chapter.topics.length} lectures
                            </span>
                          </div>
                          <button className="text-gray-500 group-hover:text-primary-dark focus:outline-none">
                            {expandedChapter === chapterIndex ? (
                              <FaAngleUp />
                            ) : (
                              <FaAngleDown />
                            )}
                          </button>
                        </div>

                        {/* === Chapter Topics & Quiz === */}
                        {expandedChapter === chapterIndex && (
                          <div className="pl-2 mt-2 space-y-1">
                            {chapter.topics.map((topic, topicIndex) => {
                              const isSelected =
                                selectedTopic?.topic.name === topic.name &&
                                selectedTopic?.chapterIndex === chapterIndex;

                              const isLocked = !topic.isCurrent;
                              const isCompleted = topic.isCompleted;

                              return (
                                <div
                                  key={topicIndex}
                                  className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 ${
                                    isSelected
                                      ? "bg-primary-light text-white shadow-md"
                                      : isLocked
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : isCompleted
                                      ? "bg-white text-gray-500"
                                      : "text-gray-700 hover:bg-gray-100"
                                  } ${
                                    !isLocked && !isSelected
                                      ? "cursor-pointer"
                                      : ""
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
                                  <div className="flex items-center space-x-2">
                                    {isCompleted ? (
                                      <FaCheckCircle className="text-green-500" />
                                    ) : isLocked ? (
                                      <FaLock className="text-red-400" />
                                    ) : (
                                      <FaLockOpen className="text-green-500" />
                                    )}
                                    <span
                                      className={`text-sm ${
                                        isCompleted ? "line-through" : ""
                                      } ${
                                        isSelected ? "font-medium" : ""
                                      }`}
                                    >
                                      {topic.name}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-xs ${
                                      isSelected ? "text-white" : "text-gray-500"
                                    }`}
                                  >
                                    {formatSecondsToHMS(
                                      topic?.videoDuration
                                    )}
                                  </span>
                                </div>
                              );
                            })}

                            {/* === Quiz Button === */}
                            {chapter.quiz && (
                              <div
                                onClick={() =>
                                  handleQuizClick(chapter.quiz, chapterIndex)
                                }
                                className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 ${
                                  selectedQuiz?.chapterIndex === chapterIndex
                                    ? "bg-primary-dark text-white shadow-md"
                                    : !chapter.quiz.isCurrent
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : chapter.quiz.isCompleted
                                    ? "bg-white text-gray-500"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                } ${
                                  chapter.quiz.isCurrent ? "cursor-pointer" : ""
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {chapter.quiz.isCompleted ? (
                                    <FaCheckCircle className="text-green-500" />
                                  ) : !chapter.quiz.isCurrent ? (
                                    <FaLock className="text-red-400" />
                                  ) : (
                                    <FaLockOpen className="text-green-500" />
                                  )}
                                  <span
                                    className={`text-sm ${
                                      chapter.quiz.isCompleted
                                        ? "line-through"
                                        : ""
                                    } ${
                                      selectedQuiz?.chapterIndex === chapterIndex
                                        ? "font-medium"
                                        : "font-semibold"
                                    }`}
                                  >
                                    Chapter Quiz
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* === Final Exam Button === */}
                    {courseData.finalExam.isCurrent && (
                      <div className="border-t border-gray-200 pt-2">
                        <div
                          onClick={handleFinalExam}
                          className={`flex items-center justify-center p-3 rounded-md transition-all duration-200 cursor-pointer ${
                            courseData.finalExam.isCompleted
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-primary-dark text-white hover:bg-primary-light"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {courseData.finalExam.isCompleted
                              ? "View Final Result"
                              : "Start Final Exam"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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