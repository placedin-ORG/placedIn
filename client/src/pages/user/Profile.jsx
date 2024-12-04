import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../utils/API";
import { FaShieldAlt, FaBook, FaFileAlt, FaTrophy } from "react-icons/fa";
const Profile = () => {
  const { user: userData } = useSelector((state) => state.user);
  const current = useSelector((state) => state);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
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
  return (
    <div className="p-6 min-h-screen">
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
                  const totalTopics = course.chapters.reduce(
                    (acc, chapter) => acc + chapter.topics.length,
                    0
                  );
                  const completedTopics = course.chapters.reduce(
                    (acc, chapter) =>
                      acc +
                      chapter.topics.filter((topic) => topic.isCompleted)
                        .length,
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
                        (acc, chapter) => acc + chapter.topics.length,
                        0
                      );
                      const completedTopics = course.chapters.reduce(
                        (acc, chapter) =>
                          acc +
                          chapter.topics.filter((topic) => topic.isCompleted)
                            .length,
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
  <h2 className="text-lg flex gap-2 font-semibold text-gray-700 items-center"> <FaTrophy className="text-yellow-400 text-3xl"/>Leaderboard</h2>
  <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-gradient-to-br shadow-md rounded-md">
    {currentUserRank && (
      <motion.div
        className={`flex items-center justify-between p-4 rounded-lg shadow transform transition-transform duration-300 bg-green-300`}
      >
        <div className="text-lg font-semibold text-gray-800">
          #{currentUserRank.position} (You)
        </div>
        <div className="text-sm text-gray-700">{currentUserRank.username}</div>
        <div className="flex items-center gap-2">
          {currentUserRank.shield === "Gold" && <span className="text-yellow-500 text-lg"><FaShieldAlt/></span>}
          {currentUserRank.shield === "Silver" && <span className="text-gray-400 text-lg"><FaShieldAlt/></span>}
          {currentUserRank.shield === "Bronze" && <span className="text-red-600 text-lg"><FaShieldAlt/></span>}
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
        .filter(student => student.position <= 100)  // Filter top 100 students
        .map((student, index) => (
          <motion.div
            key={student.position}
            className={`flex items-center justify-between p-4 rounded-lg shadow transform hover:scale-105 transition-transform duration-200 ${
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
            <div className="text-lg font-semibold text-gray-800">#{student.position}</div>
            <div className="text-sm text-gray-700">{student.username}</div>
            <div className="flex items-center gap-2">
              {student.shield === "Gold" && <span className="text-yellow-500 text-lg"><FaShieldAlt/></span>}
              {student.shield === "Silver" && <span className="text-gray-500 text-lg"><FaShieldAlt/></span>}
              {student.shield === "Bronze" && <span className="text-red-600 text-lg"><FaShieldAlt/></span>}
              <div className="text-sm font-medium text-gray-800">
                {student.totalScore} pts
              </div>
            </div>
          </motion.div>
        ))}
    </motion.div>
  </div>
</div>


    </div>
  );
};

export default Profile;
