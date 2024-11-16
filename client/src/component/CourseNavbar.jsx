import React, { useState } from 'react';
import {
  FaGraduationCap, FaRobot, FaBriefcase, FaDatabase, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const CourseNavbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (key) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  return (
    <>
      <nav className="w-screen flex text-black py-4 justify-center items-center">
        <div className="container flex flex-wrap justify-center gap-4 items-center text-sm">
          <ul className="grid grid-cols-3 md:grid-cols-4 lg:flex flex-wrap gap-4 justify-center w-full sm:space-x-8 sm:gap-4">
            {/* Doctorate Dropdown */}
            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('doctorate')}
              >
                <FaGraduationCap />
                <span className="text-sm">Doctorate</span>
                <span className="ml-2">
                  {openDropdown === 'doctorate' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'doctorate' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">PhD Programs</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Doctoral Research</a>
              </div>
            </li>

            {/* AIML Dropdown */}
            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('aiml')}
              >
                <FaRobot />
                <span className="text-sm">AIML</span>
                <span className="ml-2">
                  {openDropdown === 'aiml' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'aiml' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">AI Courses</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Machine Learning</a>
              </div>
            </li>

            {/* MBA Dropdown */}
            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('mba')}
              >
                <FaBriefcase />
                <span className="text-sm">MBA</span>
                <span className="ml-2">
                  {openDropdown === 'mba' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'mba' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Business Administration</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Executive MBA</a>
              </div>
            </li>

            {/* Data Science Dropdown */}
            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('dataScience')}
              >
                <FaDatabase />
                <span className="text-sm">Data Science</span>
                <span className="ml-2">
                  {openDropdown === 'dataScience' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'dataScience' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Analysis</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Engineering</a>
              </div>
            </li>

            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('Marketing')}
              >
                <FaDatabase />
                <span className="text-sm">Marketing</span>
                <span className="ml-2">
                  {openDropdown === 'Marketing' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'Marketing' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Analysis</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Engineering</a>
              </div>
            </li>

            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('Software & tech')}
              >
                <FaDatabase />
                <span className="text-sm">Software </span>
                <span className="ml-2">
                  {openDropdown === 'Software & tech' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'Software & tech' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Analysis</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Engineering</a>
              </div>
            </li>

            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('Management')}
              >
                <FaDatabase />
                <span className="text-sm">Management</span>
                <span className="ml-2">
                  {openDropdown === 'Management' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'Management' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Analysis</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Engineering</a>
              </div>
            </li>

            <li className="relative group hover:text-red-700 w-full sm:w-auto">
              <button
                className="flex items-center space-x-2 focus:outline-none w-full sm:w-auto"
                onClick={() => toggleDropdown('Law')}
              >
                <FaDatabase />
                <span className="text-sm">Law</span>
                <span className="ml-2">
                  {openDropdown === 'Law' ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div
                className={`absolute left-0 w-full sm:w-40 ${openDropdown === 'Law' ? 'block' : 'hidden'} bg-white text-gray-800 shadow-lg py-2 mt-1 sm:mt-0 sm:top-full z-10`}
              >
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Analysis</a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">Data Engineering</a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default CourseNavbar;
