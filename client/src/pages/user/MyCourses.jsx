import React from "react";
import SmallUnderline from "../../component/SmallUnderline";
import { useSelector } from "react-redux";
import CourseCard from "../../component/CourseCard";
import { Link } from "react-router-dom";

const MyCourses = () => {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="p-6 min-h-[90vh] flex flex-col items-center">
      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 relative">
        My Courses
        <SmallUnderline className={"w-8"} />
      </h1>

      {user?.ongoingCourses?.length == 0 ? (
        <div className="w-full h-[60vh] flex flex-col gap-2 items-center justify-center">
          <h1 className="text-center text-gray-600 text-3xl font-semibold">
            No Courses Found!
          </h1>
          <Link to={"/courses"} className="hover:underline text-primary">
            View Courses
          </Link>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {user?.ongoingCourses?.map((course, index) => {
            return <CourseCard isUser course={course} />;
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
