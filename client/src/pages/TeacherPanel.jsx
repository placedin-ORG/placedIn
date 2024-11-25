import React,{useState,useEffect} from 'react';
import Navbar from '../component/Navbar';
import {useNavigate} from  'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdAddCircleOutline } from 'react-icons/md';
import axios from "axios"
import { BiRadioCircle } from 'react-icons/bi';
const TeacherPanel = () => {
    const navigate=useNavigate();
    const [courseList,setCourseList]=useState(null);

    useEffect(()=>{
        // console.log(user.user)
       const call=async ()=>{
      const data=await axios.get("http://localhost:5000/create/getCourses");
 
      setCourseList(data.data.courses);
      
       }
       call();
      },[]);
  return (
    <>
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="flex w-full justify-center items-center py-10 bg-white shadow">
        <h1 className="font-bold text-blue-900 text-4xl md:text-5xl text-center">
          placedIn 
          <span className="text-red-400"> Course Creation</span> 
          <span className="text-red-500"> And Handling</span>
        </h1>
      </div>

      {/* Main Section */}
      <div className="flex flex-col max-w-6xl mx-auto mt-10">
        {/* Add Course Button */}
        <div className="w-full flex justify-end px-5">
          <button
            onClick={() => navigate('/create',{state:false})}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            <MdAddCircleOutline className="text-lg" />
            Add Course
          </button>
        </div>

        {/* Course List Section */}
        <div className="mt-6 px-5">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Course List</h2>
          {courseList && courseList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseList.map((course, index) => (
               <div
               key={index}
               className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
             >
               {/* Thumbnail */}
               <img
                 src={course.courseThumbnail || 'https://via.placeholder.com/150'}
                 alt={course.title}
                 className="w-full h-32 object-cover rounded-md mb-4"
               />
             
               {/* Course Title */}
               <h3 className="text-lg font-semibold text-gray-800 truncate">
                 {course.title}
               </h3>
             
               {/* Edit Button */}
               <div className="mt-4 flex justify-end gap-3">
                {
                    course.setLive ?   <div className="flex  items-center text-green-500">
    <BiRadioCircle className="text-xl mr-1 animate-pulse" />
    <span className="text-sm font-medium animate-pulse">Live</span>
  </div>:null
                }
             
                 <button
                   onClick={() => navigate(`/create`,{state:course})}
                   className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                 >
                   <FaEdit className="text-gray-500" />
                   Edit
                 </button>
               </div>
             </div>
             
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-6">
              No courses available. Click "Add Course" to create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default TeacherPanel
