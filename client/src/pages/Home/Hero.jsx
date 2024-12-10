import React, { useEffect, useState } from "react";
import Button from "../../component/Button";
import {useNavigate} from 'react-router-dom'
const Hero = () => {
  const [courseCount, setCourseCount] = useState(0);
  const navigate=useNavigate();
  // Dynamic course ticker effect
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < 500) {
        count += 10; // Increment by 10 (or adjust based on preference)
        setCourseCount(count);
      } else {
        clearInterval(interval);
      }
    }, 50); // Adjust speed
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-10 grainy-light">
      <div className="max-w-7xl mx-auto px-3 lg:px-8 flex flex-col lg:flex-row items-end gap-10">
        {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t via-slate-50/50 from-slate-50 h-28" /> */}
        {/* Left Content */}
        <div className="lg:w-1/2 text-left lg:text-left pb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-700 mb-6">
            <span className="text-primary tracking-widest leading-[1.3]">
              {" "}
              Ace{" "}
            </span>
            Your Exams with{" "}
            <span className="text-primary tracking-widest leading-[1.3]">
              {" "}
              Expertly{" "}
            </span>
            Crafted Courses and
            <span className="text-primary tracking-widest leading-[1.3]">
              {" "}
              Test Series!{" "}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Discover a world of knowledge with interactive learning tools,
            real-time analytics, and mock exams to help you succeed.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Button
              title={"Explore Courses"}
              className="bg-primary text-sky-100"
              onClick={()=>navigate('/courses')}
            />
            <Button
              title={"Take Exam Now!"}
              className="!text-primary !bg-blue-50 !border-2 !border-primary"
              onClick={()=>navigate('/allExams')}
            />
          </div>

          {/* Key Selling Points */}
          {/* <div className="text-orange-500 font-medium text-lg md:text-xl">
                <span className="font-bold text-3xl md:text-4xl">
                {courseCount}
                </span>{" "}
                + expertly crafted courses to help you excel!
            </div> */}
        </div>

        {/* Right Image */}
        <div className="lg:w-1/2 h-full rounded-lg relative scale-x-[-1] pb-[3.1rem]">
          <img
            src="/images/home/hero-2.png"
            alt="Students taking exams"
            className="w-full lg:scale-125 rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
