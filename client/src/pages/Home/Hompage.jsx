import React from "react";
import Navbar from "../../component/Navbar";
import CourseNavbar from "../../component/CourseNavbar";
import IntroHome from "../../component/IntroHome";
import CourseCard from "../../component/CourseCards";
import Features from "./Features";
import { Layout } from "../../component/Layout/Layout";
import Hero from "./Hero";
import PopularCourses from "./PopularCourses";
import FAQ from "./FAQ";
import Footer from "../../component/Layout/Footer";
import Hero2 from "./Hero2";
import TopRatedCourses from "./TopRatedCourses";
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
      <TopRatedCourses/>
      <FAQ />
      <Footer />
    </>
  );
};

export default Hompage;
