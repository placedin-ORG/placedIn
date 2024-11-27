import React, { useState, useEffect } from 'react';
import Navbar from '../component/Navbar';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import { MdAddCircleOutline } from 'react-icons/md';
import axios from 'axios';
import { BiRadioCircle } from 'react-icons/bi';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState(null);
  const [categories, setCategories] = useState([
    "software"
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // Fetch courses and categories
    const fetchData = async () => {
      const courseData = await axios.get('http://localhost:5000/create/getCourses');
      
      setCourseList(courseData.data.courses);
    };
    fetchData();
  }, []);

  const filteredCourses = selectedCategory 
    ? courseList.filter(course => course.courseCategory === selectedCategory) 
    : courseList;

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header Section */}
        <div className="flex w-full justify-center items-center py-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <h1 className="font-extrabold text-4xl md:text-5xl text-center">
            placedIn 
            <span className="text-red-400"> Course Creation</span> 
            <span className="text-red-500"> And Handling</span>
          </h1>
        </div>

        {/* Main Section */}
        <div className="flex flex-col max-w-6xl mx-auto mt-10 px-5">
          {/* Add Course Button */}
          <div className="w-full flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/create', { state: false })}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              <MdAddCircleOutline className="text-lg" />
              Add Course
            </button>
            {/* Category Filter */}
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Course List Section */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Course List</h2>
          {filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105"
                >
                  <div className="relative">
                    {/* Thumbnail */}
                    <img
                      src={course.courseThumbnail || 'https://via.placeholder.com/150'}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    {/* Live Status */}
                    {course.setLive && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <BiRadioCircle className="mr-1" />
                        Live
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Course Title */}
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{course.title}</h3>

                    {/* Category */}
                    <p className="text-sm text-gray-600 mt-2">{course.category}</p>

                    {/* Edit Button */}
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/create`, { state: course })}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        <FaEdit className="text-gray-500" />
                        Edit
                      </button>
                    </div>
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
    </>
  );
};

export default TeacherPanel;
