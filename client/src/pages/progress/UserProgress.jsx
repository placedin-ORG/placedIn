import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import { useSelector } from "react-redux";
import { FaShieldAlt, FaBook, FaFileAlt, FaTrophy } from "react-icons/fa";

const UserProgress = () => {
  const user = useSelector((state) => state);
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [league, setLeague] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const data = await API.post("/ranking/getRanking", {
          userId: user.user.user._id,
        });

        if (data.data.status) {
          const completedCourses = data.data.completedCoursesCount;
          const resultCount = data.data.resultCount;
          const rank = data.data.rank;
          const total = completedCourses + resultCount;

          setCourse(completedCourses);
          setExams(resultCount);
          setRanking(rank);

          // Determine league and progress
          setProgress(Math.min((total / 100) * 100, 100));
          if (total <= 30) setLeague("Bronze");
          else if (total <= 70) setLeague("Silver");
          else setLeague("Gold");
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchRankingData();
  }, [user]);

  const getLeagueColor = () => {
    if (league === "Bronze") return "text-yellow-700 border-yellow-500";
    if (league === "Silver") return "text-gray-400 border-gray-400";
    if (league === "Gold") return "text-yellow-500 border-yellow-700";
    return "text-gray-300 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Student Progress
        </h1>

        {/* Courses, Exams, and Ranking */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <FaBook className="text-4xl text-purple-500 mb-2" />
            <p className="text-xl font-semibold">Courses</p>
            <p className="text-lg text-gray-700">{course || 0}</p>
          </div>
          <div className="flex flex-col items-center">
            <FaFileAlt className="text-4xl text-blue-500 mb-2" />
            <p className="text-xl font-semibold">Exams</p>
            <p className="text-lg text-gray-700">{exams || 0}</p>
          </div>
          <div className="flex flex-col items-center">
            <FaTrophy className="text-4xl text-yellow-500 mb-2" />
            <p className="text-xl font-semibold">Ranking</p>
            <p className="text-lg text-gray-700">{`# ${ranking}` || "N/A"}</p>
          </div>
        </div>

        {/* League Display */}
        <div className="mt-8 flex flex-col items-center">
      <FaShieldAlt
        className={`text-6xl ${getLeagueColor()} mb-4 animate-jump-and-flip`}
      />
      <p className="text-xl font-semibold">
        League:{" "}
        <span className={`${getLeagueColor()} text-2xl font-bold uppercase`}>
          {league || "Unranked"}
        </span>
      </p>
    </div>

        {/* Progress Bar */}
        <div className="mt-8 relative">
      {/* Progress Bar Background */}
      <div className="w-full bg-gray-200 h-6 rounded-full relative overflow-hidden">
        {/* Wave Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-30 h-full animate-wave"></div>
        {/* Progress Bar */}
        <div
          className="absolute h-6 bg-gradient-to-r from-purple-700 to-blue-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>

        {/* Icons with Bobbing Motion */}
        <div
          className={`absolute top-1/2 left-[10%] -translate-y-1/2 w-10 h-10 rounded-full border-4 bg-white flex items-center justify-center animate-bob`}
        >
          <FaShieldAlt className="text-yellow-700" />
        </div>
        <div
          className={`absolute top-1/2 left-[50%] -translate-y-1/2 w-10 h-10 rounded-full border-4 bg-white flex items-center justify-center animate-bob delay-100`}
        >
          <FaShieldAlt className="text-gray-400" />
        </div>
        <div
          className={`absolute top-1/2 left-[90%] -translate-y-1/2 w-10 h-10 rounded-full border-4 bg-white flex items-center justify-center animate-bob delay-200`}
        >
          <FaShieldAlt className="text-yellow-500" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-700">
        <span>Bronze</span>
        <span>Silver</span>
        <span>Gold</span>
      </div>
    </div>
      </div>
    </div>
  );
};

export default UserProgress;
