import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";
import { FaPlayCircle } from "react-icons/fa";
import API from "../utils/API";
import Button from "./Button";
const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state);
  const dispatch = useDispatch();

  const startLearning = async (_id, title) => {
    try {
      const response = await API.post("/learn/startLearning", {
        _id,
        userId: user.user.user._id,
      });
      // console.log(response.data.user)
      if (response.data.status) {
        dispatch(
          setCurrentCourse({
            course: response.data.updatedUse,
          })
        );
        console.log(_id);
        navigate(`/intro/course/${_id}`);
        // navigate(`/courseDetail/${_id}`)
      } else {
        alert("error");
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div
        key={course._id}
        className="bg-white border border-gray-300 w-full max-w-[22rem] transition-all duration-500 ease-in-out hover:shadow-custom rounded-lg p-4 flex flex-col justify-between"
      >
        {/* Thumbnail */}
        <img
          src={
            course.courseThumbnail ||
            "https://www.gkftii.com/blog/img/multimedia-courses-scope-and-career.webp"
          }
          alt={course.title}
          className="w-full h-auto max-h-44 object-cover rounded-md mb-4"
        />

        {/* Course Title */}
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {course.title}
        </h3>

        {/* Edit Button */}
        <div className="mt-4 flex justify-between items-end gap-3">
          {course?.price ? (
            <h5 className="text-emerald-500 font-semibold">₹{course.price} </h5>
          ) : (
            <h5 className="text-emerald-500 font-semibold">Free</h5>
          )}

          <Button
            title="Start"
            className={"bg-emerald-500 !px-2 !py-1 font-semibold"}
            onClick={() => startLearning(course._id)}
          />
        </div>
      </div>
    </>
  );
};

export default CourseCard;
