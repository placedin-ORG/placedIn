import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsFillPersonFill } from "react-icons/bs";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

// import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";
import API from "../../utils/API";
import Button from "../Button";

const ExamCard = ({ exam, isUser = false, completed = false }) => {
  const navigate = useNavigate();
  // const user = useSelector((state) => state);
  const dispatch = useDispatch();

  const startLearning = async () => {
    try {
      if (isUser) {
        navigate(`/intro/exam/${exam._id}`);
      } else {
        console.log(exam._id);
        navigate(`/intro/exam/${exam._id}`);
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Function to format the date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString();
  };

  return (
    <div
      onClick={startLearning}
      key={exam?._id}
      className="bg-white border border-gray-300 w-full max-w-[22rem] transition-all duration-500 ease-in-out hover:shadow-custom rounded-lg p-4 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Thumbnail */}
        <img
          src={
            exam?.examThumbnail ||
            "https://media.geeksforgeeks.org/wp-content/cdn-uploads/20220228124519/Artboard-6-min.png"
          }
          alt={exam?.examTitle}
          className="w-full h-auto max-h-44 object-cover rounded-md mb-4"
        />

        {/* Exam Title */}
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {exam?.examTitle}
        </h3>

        {/* Teacher Name */}
        <h3 className="flex items-center gap-2 text-md font-sans text-gray-600 font-semibold mt-2">
          <BsFillPersonFill />
          {exam?.teacher?.name || "Instructor"}
        </h3>

        {/* Start Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <FaCalendarAlt />
          <span>{formatDate(exam?.startDate)}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <FaClock />
          <span>{exam?.duration} minutes</span>
        </div>
      </div>

      {/* Price and Action Button */}
      <div className="mt-4 flex justify-between items-end gap-3">
        {isUser ? (
          <h5 className="text-emerald-500 font-semibold">
            {completed ? "Completed" : "Enrolled"}
          </h5>
        ) : (
          <>
            {exam?.price > 0 ? (
              <div className="flex gap-1 items-center">
                <h5 className="text-emerald-500 bg-green-100 rounded-xl px-2 font-semibold">
                  ₹{exam.price - (exam.discountAmount || 0)}
                </h5>
                {exam.discountAmount > 0 && (
                  <p>
                    <span className="text-gray-600 line-through">
                      ₹{exam.price}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <h5 className="text-emerald-500 font-semibold">Free</h5>
            )}
          </>
        )}

          {isUser ? (
            <>
              {completed || exam?.publishResult ? (
                <button
                  className={
                    "px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed"
                  }
                  onClick={() => startLearning(exam._id)}
                  disabled={!exam?.publishResult}
                >
                  View Results
                </button>
              ) : (
                <button
                  className={
                    "px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-light"
                  }
                  onClick={() => startLearning(exam._id)}
                >
                  View
                </button>
              )}
            </>
          ) : (
            <Button
              title="View"
              className={"bg-emerald-500 !px-2 !py-1 font-semibold"}
              onClick={() => startLearning()}
            />
          )}
        </div>
      </div>
  );
};

export default ExamCard;
