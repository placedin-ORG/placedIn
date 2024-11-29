import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";
import ExamCard from "../../component/exams/ExamCard";
import axios from 'axios'
const AllExams = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    // console.log(user.user)
    const getExams = async () => {
      try {
        const data = await axios.get("http://localhost:5000/api/v1/exam/get");
        setExams(data.data.exams);
      } catch (error) {
        console.log(error);
      }
    };
    getExams();
  }, []);

  return (
    <div className="grainy-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-10">
        <h1 className="text-center text-primary text-4xl font-bold relative">
          Explore Exams
          <SmallUnderline />
        </h1>

        {exams?.length === 0 ? null : (
          <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {exams?.map((exam, index) => {
              return <ExamCard exam={exam} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllExams;
