import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";
import API from "../utils/API";
import Button from "./Button";
import { FaStar, FaRegStar } from "react-icons/fa";
import { BsFillPersonFill } from "react-icons/bs"

const CourseCard = ({ course, isUser = false }) => {
  const navigate = useNavigate();
  // const user = useSelector((state) => state);
  const dispatch = useDispatch();



  const startLearning = async () => {
    try {

      if (isUser) {
        navigate(`/courseDetail/${course.courseId}`);
      } else {
        navigate(`/intro/course/${course._id}`);
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

  const calculateAverageRating = () => {
    if (course) {
      if (course.rating.length === 0) return 0;
      const totalRating = course.rating.reduce(
        (acc, cur) => acc + cur.rating,
        0
      );
      return totalRating / course.rating.length;
    }
  };

  const averageRating = calculateAverageRating();
  return (
    <>
      <div
        onClick={() => startLearning()}
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
          {course.title || course?.courseName}
        </h3>
        {/* { tecaher name} */}

        <h3 className=" flex items-center gap-2 text-lg font-sans text-gray-500 font-semibold">
           <BsFillPersonFill />
          {course?.teacher?.name}
        </h3>

         {/** Ratings */}
                            <div className="flex items-center rounded-lg gap-2  w-full max-w-sm">
                            <span className=" text-yellow-700 font-extrabold  mt-[10px] ">{averageRating .toFixed(1)}</span>

                             <div className="flex justify-start">
                             {Array.from({ length: 5 }).map((_, index) =>
                               index < averageRating ? (
                                    <FaStar
                                      key={index}
                                      className="text-yellow-500 text-xl pt-2"
                                    />
                                  ) : (
                                    <FaRegStar
                                      key={index}
                                      className="text-gray-400 text-xl pt-2"
                                    />
                                  )
                                )}
                              </div>
                              <div className=" flex items-center mt-[10px]  text-gray-500 font-semibold ">
                               ({course.rating.length}) 
                              </div>
                            </div>


        {/* Edit Button */}
        <div className="mt-4 flex justify-between items-end gap-3">
          {isUser ? (
            <h5>
              <h5 className="text-emerald-500 font-semibold">Enrolled</h5>
            </h5>
          ) : (
            <>
              {course?.price ? (
                <div className="flex gap-1 items-center">
                  <h5 className="text-emerald-500 bg-green-100 rounded-xl px-2 font-semibold">
                    ₹{course.price - course.discountAmount}{" "}
                  </h5>
                  {course.discountAmount > 0 && (
                    <p>
                      <span className="text-gray-600 line-through">
                        ₹{course.price}{" "}
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
            <button
              className={
                "px-4 py-1 bg-primary text-white rounded-md hover:bg-primary-light"
              }
              onClick={() => startLearning(course._id)}
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

export default CourseCard;
