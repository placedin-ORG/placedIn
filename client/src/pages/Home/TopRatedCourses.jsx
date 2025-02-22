import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";
const TopRatedCourses=()=>{
    const [courses, setCourses] = useState([]);

    useEffect(() => {
      // console.log(user.user)
      const getCourses = async () => {
        try {
          const data = await API.get("/create/topRatedCourses");
          setCourses(data.data.courses);
        } catch (error) {
          console.log(error);
        }
      };
      getCourses();
    }, []);
    return (
        <>
        {
          courses?.length!==0 ? <div className="grainy-light">
      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-16">
        <h1 className="text-center text-primary text-4xl font-bold relative">
         Top Rated Courses
          <SmallUnderline />
        </h1>

        {courses?.length === 0 ? null : (
          <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses?.map((course, index) => {
              return <CourseCard course={course} />;
            })}
          </div>
        )}
      </div>
    </div>: null
        }
         
        </>
    )
}

export default TopRatedCourses