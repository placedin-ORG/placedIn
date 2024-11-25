import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
const CourseCards = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state);
  const [courses, setCourses] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    // console.log(user.user)
    const call = async () => {
      const data = await axios.get("http://localhost:5000/create/getCourses");
      console.log(data);
      setCourses(data.data.courses);
    };
    call();
  }, []);

  const startLearning = async (_id) => {
    try {
      console.log(user.user.user);
      const response = await axios.post(
        "http://localhost:5000/learn/startLearning",
        {
          _id,
          userId: user.user.user._id,
        }
      );
      // console.log(response.data.user)
      if (response.data.status) {
        dispatch(
          setCurrentCourse({
            course: response.data.updatedUse,
          })
        );
        navigate(`/courseDetail/${_id}`);
      } else {
        alert("error");
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      {courses?.length === 0 ? null : (
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses?.map((course, index) => {
            return (
              <>
                <div class="w-full md:w-64 p-4 h-full rounded-3xl bg-gray-100 border border-gray-300 transition-shadow duration-300 ease-in-out shadow-sm hover:shadow-custom">
                  <div className="w-full flex justify-center items-center">
                    <img
                      src="/images/home/thumb.png"
                      className="w-full h-full max-h-48 object-cover"
                      alt=""
                    />
                  </div>
                  <div class="text-gray-900">
                    <h3 class="text-xl font-bold py-3">{course.title}</h3>
                    <p className="text-sm text-gray-800">
                      {course.description}
                    </p>
                  </div>
                  <Button
                    className={"p-0"}
                    title={" Start learning"}
                    onClick={() => startLearning(course._id)}
                  />
                </div>
              </>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CourseCards;
