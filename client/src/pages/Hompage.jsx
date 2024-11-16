import React from 'react';
import Navbar from '../component/Navbar';
import CourseNavbar from '../component/CourseNavbar';
import IntroHome from '../component/IntroHome';
import CourseCard from '../component/CourseCard'
const Hompage = () => {
  return (
    <>
       <Navbar/>
       <CourseNavbar/>
       <IntroHome/>
       <CourseCard/>
    </>
  );
}

export default Hompage;
