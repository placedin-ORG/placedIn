import React, { useEffect, useState } from "react";
import Button from "../../component/Button";

const Hero = () => {
  const [courseCount, setCourseCount] = useState(0);

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
    <section className="relative pt-16 grainy-light">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
        {/* Left Content */}
        <div className="lg:w-1/2 text-left lg:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Ace Your Exams with Expertly Crafted Courses and Test Series!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Discover a world of knowledge with interactive learning tools,
            real-time analytics, and mock exams to help you succeed.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex justify-center lg:justify-start gap-4">
            <Button
              title={"Explore Courses"}
              className="bg-primary text-sky-100"
            />
            <Button
              title={"Take Test Now!"}
              className="!text-primary !bg-blue-50 !border-2 !border-primary"
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
        <div className="lg:w-1/2 rounded-lg relative">
          <img
            src="/images/home/hero-2.png"
            alt="Students taking exams"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
