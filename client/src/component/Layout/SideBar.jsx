import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { LiaTimesSolid } from "react-icons/lia";
import { MdOutlineHomeWork } from "react-icons/md";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { BsHouseDoor } from "react-icons/bs";
import { FaBook, FaUserCircle, FaClipboardList } from "react-icons/fa";
import { MdOutlineQuiz, MdOutlineSettings } from "react-icons/md";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { setLogOut } from "../../redux/UserSlice";
import { PiExam } from "react-icons/pi";
import { FiBookOpen } from "react-icons/fi";
import { GiProgression } from "react-icons/gi";
import { LiaMoneyCheckSolid } from "react-icons/lia";

const SideBar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = async () => {
    try {
      dispatch(setLogOut());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      <span
        className="fixed z-30 lg:hidden text-4xl md:text-5xl top-2 md:top-16 right-24 cursor-pointer"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <LiaTimesSolid className="font-thin border border-primary px-2 text-primary bg-gray-100 hover:bg-gray-200 rounded-md" />
        ) : (
          <HiMiniBars3BottomLeft className="px-2 text-white bg-primary rounded-md" />
        )}
      </span>
      <div
        className={`sidebar transition-all duration-300 ease-in-out fixed bottom-0 lg:left-0 px-2 w-[300px] lg:w-[230px] top-12 md:top-16 overflow-y-auto text-center bg-white z-40 ${
          !isSidebarOpen ? "-left-[300px]" : "left-0"
        }`}
      >
        <NavLink
          to={"/user/profile"}
          className={({ isActive }) =>
            `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 ${
              isActive && "bg-emerald-100 text-primary"
            }`
          }
        >
          <BsHouseDoor className="text-xl" />
          <span className="text-[15px] ml-4 font-semibold">Profile</span>
        </NavLink>

        {/* Courses */}
        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary"
          onClick={() => toggleDropdown("courses")}
        >
          <FiBookOpen className="text-lg" />
          <div className="flex justify-between w-full items-center">
            <span className="text-[15px] ml-4 font-semibold">Courses</span>
            <span
              className={`text-lg transition-transform duration-300 ${
                openDropdown === "courses" ? "rotate-180" : ""
              }`}
            >
              <BiChevronDown />
            </span>
          </div>
        </div>
        <div
          className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
            openDropdown === "courses" ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="text-left text-sm mt-2 w-4/5 mx-auto font-semibold">
            <NavLink
              to={"/user/enrolled/courses"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              My Courses
            </NavLink>
            <NavLink
              to={"/courses"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              Explore Courses
            </NavLink>
          </div>
        </div>

        {/* Exams */}
        <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary"
          onClick={() => toggleDropdown("exams")}
        >
          <PiExam className="text-xl" />
          <div className="flex justify-between w-full items-center">
            <span className="text-[15px] ml-4 font-semibold">Exams</span>
            <span
              className={`text-lg transition-transform duration-300 ${
                openDropdown === "exams" ? "rotate-180" : ""
              }`}
            >
              <BiChevronDown />
            </span>
          </div>
        </div>
        <div
          className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
            openDropdown === "exams" ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="text-left text-sm mt-2 w-4/5 mx-auto font-semibold">
            <NavLink
              to={"/user/my/exams"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              My Exams
            </NavLink>
            <NavLink
              to={"/allExams"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              All Exams
            </NavLink>
          </div>
        </div>

        {/* Tests */}
        {/* <div
          className="p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary"
          onClick={() => toggleDropdown("tests")}
        >
          <MdOutlineQuiz className="text-xl" />
          <div className="flex justify-between w-full items-center">
            <span className="text-[15px] ml-4 font-semibold">Tests</span>
            <span
              className={`text-lg transition-transform duration-300 ${
                openDropdown === "tests" ? "rotate-180" : ""
              }`}
            >
              <BiChevronDown />
            </span>
          </div>
        </div>
        <div
          className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
            openDropdown === "tests" ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="text-left text-sm mt-2 w-4/5 mx-auto font-semibold">
            <NavLink
              to={"/tests/practice"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              Practice Tests
            </NavLink>
            <NavLink
              to={"/tests/mock"}
              className={({ isActive }) =>
                `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
                  isActive && "bg-emerald-100 text-primary"
                }`
              }
            >
              Mock Tests
            </NavLink>
          </div>
        </div> */}

        {/* Progress */}
        <NavLink
          to={"/user/progress"}
          className={({ isActive }) =>
            `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
              isActive && "bg-emerald-100 text-primary"
            }`
          }
        >
          <GiProgression className="text-xl" />
          <span className="text-[15px] ml-4 font-semibold">Progress</span>
        </NavLink>

        {/* Transactions */}
        <NavLink
          to={"/user/transactions"}
          className={({ isActive }) =>
            `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
              isActive && "bg-emerald-100 text-primary"
            }`
          }
        >
          <LiaMoneyCheckSolid className="text-xl" />
          <span className="text-[15px] ml-4 font-semibold">Transactions</span>
        </NavLink>

        {/* Host */}
        <NavLink
          to={"/user/host"}
          className={({ isActive }) =>
            `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
              isActive && "bg-emerald-100 text-primary"
            }`
          }
        >
          <MdOutlineHomeWork className="text-xl" />
          <span className="text-[15px] ml-4 font-semibold">Host</span>
        </NavLink>
        {/* Settings */}
        <NavLink
          to={"/user/settings"}
          className={({ isActive }) =>
            `p-2.5 mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary ${
              isActive && "bg-emerald-100 text-primary"
            }`
          }
        >
          <MdOutlineSettings className="text-xl" />
          <span className="text-[15px] ml-4 font-semibold">Settings</span>
        </NavLink>
        {/* <div className="my-4 bg-blue-500 h-[0.5px]" /> */}

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="p-2.5 w-full mt-3 flex items-center rounded-md px-4 duration-300 cursor-pointer hover:bg-emerald-100 text-gray-700 hover:text-primary"
        >
          <LuLogOut />
          <span className="text-[15px] ml-4 font-semibold">Logout</span>
        </button>
      </div>
    </>
  );
};

export default SideBar;
