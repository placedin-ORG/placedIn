import React,{useState} from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import {useNavigate} from 'react-router-dom'
const Navbar = () => {
  const navigate=useNavigate();
  const { user } = useSelector((state) => state.user);
  const [search,setSearch]=useState('');

  const handleSearch=(e)=>{
    try{
         e.preventDefault();
      if(search!==''){
navigate(`/search/${search}`);
      }
   
       
      
    }catch(err){
      console.log(err.message);
    }
  }
  return (
    <nav className="sticky z-20 h-14 md:h-16 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/50 backdrop-blur-lg transition-all text-sm">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to={"/"} className="flex items-center">
            <img
              src="https://via.placeholder.com/40"
              alt="Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-xl font-semibold text-primary">PlacedIn</span>
          </Link>

          <div className="hidden md:block">
            <form onSubmit={(e)=>handleSearch(e)}>
               <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              type="text"
              placeholder="Search What want to learn today? And press Enter"
              className="cursor-pointer px-4 py-1.5 w-full md:min-w-[25rem] border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
            </form>
           
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-5">
            <div className="hidden md:flex space-x-6 items-center">
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-700 hover:text-primary font-medium"
                }
              >
                Courses
              </NavLink>
              <NavLink
                to="/allExams"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-700 hover:text-primary font-medium"
                }
              >
                Exams
              </NavLink>
              <NavLink
                to="/test-series"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-700 hover:text-primary font-medium"
                }
              >
                Test Series
              </NavLink>
              <NavLink
                to="/skill-academy"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-700 hover:text-primary font-medium"
                }
              >
                Skill Academy
              </NavLink>
            </div>

            {user ? (
              <Link
                to={"/user/profile"}
                className="bg-primary text-xs sm:text-sm text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Profile
              </Link>
            ) : (
              <Link
                to={"/register"}
                className="bg-primary text-xs sm:text-sm text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
