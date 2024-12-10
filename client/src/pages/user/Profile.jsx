import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../utils/API";
import { FaShieldAlt, FaBook, FaFileAlt, FaTrophy } from "react-icons/fa";
import ProfileModel from "../../component/model/ProfileModel";
import axios from "axios";
import CoinModel from "../../component/CoinModel";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const navigate = useNavigate();
  const { user: userData } = useSelector((state) => state.user);
  const current = useSelector((state) => state);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [showModel, setShowModal] = useState(false);
  const [userId, setid] = useState(null);
  const [daily, setDaily] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [todayCoin, setTodayCoin] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const call = async () => {
      const data = await API.post("/dailyQuestion", {
        content: ["business", "software"],
        userId: current.user.user._id,
      });
      if (data.data.status) {
        setDaily(data.data.daily);
      } else {
        setDaily(data.data.daily);
      }
    };
    call();
  }, []);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log(current.user.user._id);
        const response = await API.get(
          `/ranking/site-leaderboard?userId=${current.user.user._id}`
        );
        if (response.data.status) {
          setLeaderboard(response.data.leaderboard);
          setCurrentUserRank(response.data.currentUserRank);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, [current]);

  const handleProfileClick = (_id) => {
    setShowModal(true);
    setid(_id);
  };

  const getShieldStyle = (shield) => {
    switch (shield) {
      case "Gold":
        return "bg-yellow-400 text-yellow-900";
      case "Silver":
        return "bg-gray-400 text-gray-900";
      case "Bronze":
        return "bg-orange-400 text-orange-900";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handleSubmit = async () => {
    try {
      const data = await API.post("/submit-daily", {
        userId: current.user.user._id,
        selectedOption,
      });
      if (data.data.status) {
        setDaily(data.data.daily);
        if (data.data.daily.yourAnswer[0] === data.data.daily.correct[0]) {
          setTodayCoin(5);
          await API.post("/login/dailyLogin", {
            userId: current.user.user._id,
            coin: 5,
          });
          setIsModalOpen(true);
          setTimeout(() => {
            setIsModalOpen(false);
          }, 3000);
        } else {
          setTodayCoin(3);
          await API.post("/login/dailyLogin", {
            userId: current.user.user._id,
            coin: 3,
          });
          setIsModalOpen(true);
          setTimeout(() => {
            setIsModalOpen(false);
          }, 3000);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div className="p-6 min-h-screen">
      {isModalOpen && (
        <CoinModel
          setIsModalOpen={setIsModalOpen}
          coin={todayCoin}
          type="all"
        />
      )}
      {/* Header */}
      <div className="flex justify-between items-start mb-6 px-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Welcome,{" "}
            <span className="block sm:inline text-primary font-mono tracking-widest">
              {userData.name}
            </span>
          </h1>
          <p className="text-sm font-semibold text-gray-500">
            {userData.email}
          </p>
        </div>
        <Link
          to={"/user/settings"}
          className="px-4 py-2 bg-primary whitespace-nowrap text-white rounded-md hover:bg-primary-light"
        >
          Edit Profile
        </Link>
      </div>
      {/*Daily Question*/}
      <div className="p-4 md:p-8 bg-gray-50 ">
        {daily &&
          (Array.isArray(daily.categories) && daily.categories.length === 0 ? (
            <p onClick={() => navigate("/add-interest")}>
              add interest to earn maximum 5 coin daily
            </p>
          ) : (
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
              {!daily.completed ? (
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                    {daily.question}
                  </h2>
                  <div className="space-y-4">
                    {daily.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:shadow-md transition-all cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="radio"
                          name="dailyOptions"
                          value={option}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="form-radio w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-400"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                    <button
                      onClick={() => handleSubmit()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-green-700 transition-all focus:outline-none focus:ring focus:ring-green-400"
                    >
                      Submit
                    </button>
                    <button
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-700 transition-all focus:outline-none focus:ring focus:ring-blue-400"
                      onClick={() => navigate("/add-interest")}
                    >
                      Edit Interest
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                    {daily.question}
                  </h2>
                  {daily.yourAnswer[0] === daily.correct[0] ? (
                    <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                      <span className="text-lg">🎉</span>
                      <p>
                        Your answer is correct!{" "}
                        <strong>{daily.yourAnswer}</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
                        <span className="text-lg">😞</span>
                        <p>
                          Wrong answer: <strong>{daily.yourAnswer}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                        <span className="text-lg">💡</span>
                        <p>
                          Correct answer:{" "}
                          <strong>
                            {daily.options.find(
                              (opt) => opt.charAt(0) === daily.correct[0]
                            )}
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-700 transition-all focus:outline-none focus:ring focus:ring-blue-400"
                    onClick={() => navigate("/add-interest")}
                  >
                    Edit Interest
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-orange-500 text-4xl">🌕</span>
            <div>
              <p className="text-base font-semibold text-gray-500">Coins</p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.coins}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-blue-500 text-4xl">📘</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Ongoing Courses
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.ongoingCourses.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-green-500 text-5xl">🎓</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Exams Attempted
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.examsAttempted.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Courses */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">Ongoing Courses</h2>
        <div className="mt-4">
          {userData?.ongoingCourses?.map((course) => (
            <div key={course.courseId} className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold capitalize text-primary">
                  {course.courseName}
                </h3>
                <Link
                  to={`/courseDetail/${course.courseId}`}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
                >
                  Continue Learning
                </Link>
              </div>
              <p className="text-sm font-normal text-gray-500">
                Progress:{" "}
                {(() => {
                  const totalTopics = course.chapters.reduce((sum, chapter) => {
                    const topicsCount = chapter.topics.length;
                    const quizCount = chapter.quiz ? 1 : 0;
                    return sum + topicsCount + quizCount;
                  }, 0);
                  const completedTopics = course.chapters.reduce(
                    (sum, chapter) => {
                      const completedTopics = chapter.topics.filter(
                        (topic) => topic.isCompleted
                      ).length;
                      const completedQuiz =
                        chapter.quiz && chapter.quiz.isCompleted ? 1 : 0;
                      return sum + completedTopics + completedQuiz;
                    },
                    0
                  );
                  return totalTopics > 0
                    ? ((completedTopics / totalTopics) * 100).toFixed(0)
                    : 0;
                })()}
                %
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(() => {
                      const totalTopics = course.chapters.reduce(
                        (sum, chapter) => {
                          const topicsCount = chapter.topics.length;
                          const quizCount = chapter.quiz ? 1 : 0;
                          return sum + topicsCount + quizCount;
                        },
                        0
                      );
                      const completedTopics = course.chapters.reduce(
                        (sum, chapter) => {
                          const completedTopics = chapter.topics.filter(
                            (topic) => topic.isCompleted
                          ).length;
                          const completedQuiz =
                            chapter.quiz && chapter.quiz.isCompleted ? 1 : 0;
                          return sum + completedTopics + completedQuiz;
                        },
                        0
                      );
                      return totalTopics > 0
                        ? (completedTopics / totalTopics) * 100
                        : 0;
                    })()}%`,
                  }}
                ></div>
              </div>

              {/* Chapter Details */}
              <div className="mt-4 space-y-2">
                {course.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-600"
                  >
                    <p className="flex items-center">
                      <span
                        className={`mr-2 ${
                          chapter.isCompleted
                            ? "text-green-500"
                            : chapter.isCurrent
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}
                      >
                        {chapter.isCompleted
                          ? "✔️"
                          : chapter.isCurrent
                          ? "🎯"
                          : "🔄"}
                      </span>
                      {chapter.title}
                    </p>
                    <p>
                      {chapter.isCompleted
                        ? "Completed"
                        : chapter.isCurrent
                        ? "In Progress"
                        : "Remaining"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Leaderboard (Placeholder) */}
      <div className="mt-8">
        <h2 className="text-lg flex gap-2 font-semibold text-gray-700 items-center">
          {" "}
          <FaTrophy className="text-yellow-400 text-3xl" />
          Leaderboard
        </h2>
        <div className="w-full max-w-7xl mx-auto mt-6 p-4 bg-gradient-to-br  rounded-md">
          {currentUserRank && (
            <motion.div
              className={`flex items-center justify-between p-4 rounded-lg shadow transform transition-transform duration-300 bg-green-300`}
            >
              <div className="text-lg font-semibold text-gray-800">
                #{currentUserRank.position} (You)
              </div>
              <div className="text-sm text-gray-700">
                {currentUserRank.username}
              </div>
              <div className="flex items-center gap-2">
                {currentUserRank.shield === "Gold" && (
                  <span className="text-yellow-500 text-lg">
                    <FaShieldAlt />
                  </span>
                )}
                {currentUserRank.shield === "Silver" && (
                  <span className="text-gray-400 text-lg">
                    <FaShieldAlt />
                  </span>
                )}
                {currentUserRank.shield === "Bronze" && (
                  <span className="text-red-600 text-lg">
                    <FaShieldAlt />
                  </span>
                )}
                <div className="text-sm font-medium text-gray-800">
                  {currentUserRank.totalScore} pts
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 gap-4 mt-4 overflow-y-auto h-80"
          >
            {leaderboard
              .filter((student) => student.position <= 100) // Filter top 100 students
              .map((student, index) => (
                <motion.div
                  key={student.position}
                  onClick={() => handleProfileClick(student.userId)}
                  className={`flex cursor-pointer hover:opacity-90 items-center justify-between p-4 rounded-lg shadow transform hover:scale-105 transition-transform duration-200 ${
                    student.position <= 3 ? "bg-yellow-400" : "bg-grey-100"
                  }`}
                  initial={{ x: "-50vw" }}
                  animate={{ x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    delay: index * 0.05,
                  }}
                >
                  <div className="text-lg font-semibold text-gray-800">
                    #{student.position}
                  </div>
                  <div className="text-sm text-gray-700">
                    {student.username}
                  </div>
                  <div className="flex items-center gap-2">
                    {student.shield === "Gold" && (
                      <span className="text-yellow-500 text-lg">
                        <FaShieldAlt />
                      </span>
                    )}
                    {student.shield === "Silver" && (
                      <span className="text-gray-500 text-lg">
                        <FaShieldAlt />
                      </span>
                    )}
                    {student.shield === "Bronze" && (
                      <span className="text-red-600 text-lg">
                        <FaShieldAlt />
                      </span>
                    )}
                    <div className="text-sm font-medium text-gray-800">
                      {student.totalScore} pts
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </div>

      {showModel && (
        <ProfileModel setShowModal={setShowModal} userId={userId} />
      )}
    </div>
  );
};

export default Profile;
