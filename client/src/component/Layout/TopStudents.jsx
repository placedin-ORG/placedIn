import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import API from "../../utils/API";
import { FaShieldAlt, FaBook, FaFileAlt, FaTrophy } from "react-icons/fa";
import ProfileModel from "../model/ProfileModel";
const TopStudents = () => {
  const current = useSelector((state) => state);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [showModel, setShowModal] = useState(false);
  const [userId, setid] = useState(null);
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
          console.log(response.data)
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

  const handleProfileClick = (_id) => {
    setShowModal(true);
    setid(_id);
  };

  return (
    <>
      <div className="grainy-light pb-10">
        <h2 className="w-full text-2xl flex gap-3 font-semibold justify-center items-center bg-gradient-to-r from-green-300 to-green-500 text-white p-4 rounded-lg ">
          <FaTrophy className="text-yellow-400 text-4xl animate-pulse" />
          <span className="text-2xl font-bold text-white">Top Students</span>
        </h2>

        <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-gradient-to-br rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Top 3 Students */}
            { leaderboard
              .filter((student) => student.position <= 3) // Filter top 3 students
              .map((student, index) => (
                <motion.div
                  key={student.position}
                  onClick={() => handleProfileClick(student.userId)}
                  className="cursor-pointer flex flex-col items-center p-6 rounded-lg shadow hover:scale-105 transition-all duration-500 transform-gpu hover:rotate-2 hover:shadow-custom hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-yellow-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 60,
                    delay: index * 0.1,
                  }}
                >
                  {/* Profile Image */}
                  <img
                    src={student.avatar} // Fallback if no image
                    alt={`${student.username}'s Profile`}
                    className="w-24 h-24 rounded-full border-4 border-yellow-500 mb-4 transform transition-all duration-300 hover:scale-125"
                  />
                  <div className="text-xl font-semibold text-gray-800">
                    #{student.position}
                  </div>
                  <div className="text-lg text-gray-700">
                    {student.username}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
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
          </div>
        </div>
      </div>

      {showModel && (
        <ProfileModel setShowModal={setShowModal} userId={userId} />
      )}
    </>
  );
};

export default TopStudents;
