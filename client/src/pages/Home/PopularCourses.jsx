import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";

const PopularCourses = () => {
  const [courses, setCourses] = useState([]);
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    const flakeCount = 50; // Adjust number of snowflakes
    const generatedFlakes = Array.from({ length: flakeCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random position across the screen width
      animationDuration: `${Math.random() * 3 + 2}s`, // Random speed
      delay: `${Math.random() * 5}s`, // Random delay
    }));
    setFlakes(generatedFlakes);
  }, []);
  useEffect(() => {
    // console.log(user.user)
    const getCourses = async () => {
      try {
        const data = await API.get("/create/getCourses");
        setCourses(data.data.courses);
      } catch (error) {
        console.log(error);
      }
    };
    getCourses();
  }, []);

  return (
    <div className="grainy-light relative overflow-hidden">
    {/* Snowfall Component */}
    <div className="snowfall">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}vw`, // Random position
            animationDuration: flake.animationDuration, // Random speed
            animationDelay: flake.delay, // Random delay
          }}
        ></div>
      ))}
    </div>

    <div className="max-w-7xl mx-auto px-3 lg:px-8 py-16 relative z-10">
      <h1 className="text-center text-primary text-4xl font-bold relative">
        Popular Courses
        <SmallUnderline />
      </h1>

      {courses?.length === 0 ? null : (
        <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses?.map((course, index) => {
            return <CourseCard course={course} key={index} />;
          })}
        </div>
      )}
    </div>
  </div>
  
  );
};

export default PopularCourses;
