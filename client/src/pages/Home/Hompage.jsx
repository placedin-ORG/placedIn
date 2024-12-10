import React from "react";
import Navbar from "../../component/Navbar";
import CourseNavbar from "../../component/CourseNavbar";
import Features from "./Features";
import Hero from "./Hero";
import PopularCourses from "./PopularCourses";
import FAQ from "./FAQ";
import Footer from "../../component/Layout/Footer";
import Hero2 from "./Hero2";
import TopRatedCourses from "./TopRatedCourses";
import TopStudents from "../../component/Layout/TopStudents";
const Hompage = () => {
  return (
    <>
      <Navbar />
      <CourseNavbar />

      {/* <IntroHome />
       */}
      <Hero />
      {/* <Hero2 /> */}
      <Features />
      <PopularCourses />
      <TopRatedCourses />
      <TopStudents />
      <FAQ />
      <Footer />
    </>
  );
};

export default Hompage;
