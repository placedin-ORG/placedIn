import React, { useEffect,useState } from 'react';
import {useSelector,useDispatch} from 'react-redux';
import axios from 'axios'
import {setCurrentCourse} from '../redux/UserSlice';
import {useNavigate} from "react-router-dom";
import { FaPlayCircle } from "react-icons/fa";
const CourseCard = () => {
 
  const navigate=useNavigate();
  const user=useSelector((state)=>state);
  const [courses,setCourses]=useState([]);
  const dispatch=useDispatch();
useEffect(()=>{
  // console.log(user.user)
 const call=async ()=>{
const data=await axios.get("http://localhost:5000/create/getCourses");
setCourses(data.data.courses);

 }
 call();
},[]);
if (courses.length === 0) return null;
const startLearning=async(_id,title)=>{
  try{
    console.log(user.user.user)
 const response=await axios.post("http://localhost:5000/learn/startLearning",{
    _id,
    userId:user.user.user._id
  });
// console.log(response.data.user)
  if(response.data.status){
    dispatch(
    setCurrentCourse({
      course: response.data.updatedUse
    })
    )
    console.log(_id)
    navigate(`/intro/course/${_id}`)
    // navigate(`/courseDetail/${_id}`)
  }else{
    alert("error")
  }
  }catch(err){
    console.log(err)
  }
 
}
  return (
    <>
      {courses.map(
        (course, index) =>
          course.setLive && (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transform transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-60 w-full">
                <img
                  src={course.courseThumbnail}
                  alt={`${course.title} thumbnail`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h1 className="text-lg font-bold text-gray-800 mb-2">
                  {course.title}
                </h1>
                <button
                  onClick={() => startLearning(course._id, course.title)}
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  <FaPlayCircle className="mr-2" />
                  Start Learning
                </button>
              </div>
            </div>
          )
      )}
    </>
  );
};

export default CourseCard;
