import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="https://via.placeholder.com/40"
              alt="Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-xl font-semibold text-blue-500">
              PlacedIn
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink
              to="/exams"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-500 font-medium border-b-2 border-blue-500"
                  : "text-gray-700 hover:text-blue-500 font-medium"
              }
            >
              Exams
            </NavLink>
            <NavLink
              to="/supercoaching"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-500 font-medium border-b-2 border-blue-500"
                  : "text-gray-700 hover:text-blue-500 font-medium"
              }
            >
              SuperCoaching
            </NavLink>
            <NavLink
              to="/test-series"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-500 font-medium border-b-2 border-blue-500"
                  : "text-gray-700 hover:text-blue-500 font-medium"
              }
            >
              Test Series
            </NavLink>
            <NavLink
              to="/skill-academy"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-500 font-medium border-b-2 border-blue-500"
                  : "text-gray-700 hover:text-blue-500 font-medium"
              }
            >
              Skill Academy
            </NavLink>
            <NavLink
              to="/more"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-500 font-medium border-b-2 border-blue-500"
                  : "text-gray-700 hover:text-blue-500 font-medium"
              }
            >
              More
            </NavLink>
          </div>

          {/* Search and Get Started Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
