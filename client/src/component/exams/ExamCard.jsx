import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";
import API from "../../utils/API";
import Button from "../Button";

const ExamCard = ({ exam, isUser = false }) => {
  const navigate = useNavigate();
  // const user = useSelector((state) => state);
  const dispatch = useDispatch();
console.log(exam._id)
  const startLearning = async () => {
    try {
      // const response = await API.post("/learn/startLearning", {
      //   _id,
      //   userId: user.user.user._id,
      // });
      // console.log(response.data.user)
      // if (response.data.status) {
      //   dispatch(
      //     setCurrentCourse({
      //       course: response.data.updatedUse,
      //     })
      //   );
      //   console.log(_id);

      if (isUser) {
        navigate(`/courseDetail/${course.courseId}`);
      } else {
        console.log(exam._id)
        navigate(`/intro/exam/${exam._id}`);
        window.location.reload();
      }

      // navigate(`/courseDetail/${_id}`)
      // } else {
      //   alert("error");
      // }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div
        key={exam._id}
        className="bg-white border border-gray-300 w-full max-w-[22rem] transition-all duration-500 ease-in-out hover:shadow-custom rounded-lg p-4 flex flex-col justify-between"
      >
        {/* Thumbnail */}
        <img
          src={
            exam.examThumbnail ||
            "https://www.gkftii.com/blog/img/multimedia-courses-scope-and-career.webp"
          }
          alt={exam.examTitle}
          className="w-full h-auto max-h-44 object-cover rounded-md mb-4"
        />

        {/* Course Title */}
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {exam.examTitle || exam?.examTitle}
        </h3>

        {/* Edit Button */}
        <div className="mt-4 flex justify-between items-end gap-3">
          {isUser ? (
            <h5>
              <h5 className="text-emerald-500 font-semibold">Enrolled</h5>
            </h5>
          ) : (
            <>
              {exam?.price ? (
                <h5 className="text-emerald-500 font-semibold">
                  ₹{exam.price}{" "}
                </h5>
              ) : (
                <h5 className="text-emerald-500 font-semibold">Free</h5>
              )}
            </>
          )}

          {isUser ? (
            <button
              className={
                "px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-light"
              }
              onClick={() => startLearning(exam._id)}
            >
              View
            </button>
          ) : (
            <Button
              title="View"
              className={"bg-emerald-500 !px-2 !py-1 font-semibold"}
              onClick={() => startLearning()}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ExamCard;
