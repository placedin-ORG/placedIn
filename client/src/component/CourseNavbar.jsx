import React, { useState } from "react";
import {
  FaGraduationCap,
  FaRobot,
  FaBriefcase,
  FaDatabase,
} from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import {useNavigate} from 'react-router-dom'
// Navbar data
const navbarData = [
  {
    key: "doctorate",
    icon: FaGraduationCap,
    label: "Doctorate",
    items: ["PhD Programs", "Doctoral Research"],
  },
  {
    key: "aiml",
    icon: FaRobot,
    label: "AIML",
    items: ["AI Courses", "Machine Learning"],
  },
  {
    key: "mba",
    icon: FaBriefcase,
    label: "MBA",
    items: ["Business Administration", "Executive MBA"],
  },
  {
    key: "dataScience",
    icon: FaDatabase,
    label: "Data Science",
    items: ["Data Analysis", "Data Engineering"],
  },
  {
    key: "marketing",
    icon: FaDatabase,
    label: "Marketing",
    items: ["Marketing Basics", "Advanced Marketing"],
  },
  {
    key: "software",
    icon: FaDatabase,
    label: "Software & Tech",
    items: ["Software Development", "Tech Trends"],
  },
  {
    key: "management",
    icon: FaDatabase,
    label: "Management",
    items: ["Leadership", "Operations"],
  },
  {
    key: "law",
    icon: FaDatabase,
    label: "Law",
    items: ["Corporate Law", "Criminal Law"],
  },
];

const CourseNavbar = () => {
  const [openKey, setOpenKey] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate=useNavigate();
  const handleToggle = (key) => {
    setOpenKey((prevKey) => (prevKey === key ? null : key));
  };

  return (
    // <nav className="grainy-dark">
    //   {/* Mobile Hamburger Menu */}
    //   <div className="md:hidden px-4 py-3 flex items-center justify-between">
    //     <h1 className="text-lg font-semibold text-gray-800">Courses</h1>
    //     <button
    //       onClick={() => setIsMenuOpen(!isMenuOpen)}
    //       className="focus:outline-none text-gray-800 hover:text-primary"
    //     >
    //       <FiMenu className="text-2xl" />
    //     </button>
    //   </div>

    //   {/* Navbar Items */}
    //   <div
    //     className={`${
    //       isMenuOpen ? "block" : "hidden"
    //     } md:block w-full px-4 py-2`}
    //   >
    //     <div className="flex flex-col md:flex-row md:flex-wrap justify-center space-y-4 md:space-y-0 md:space-x-4">
    //       {navbarData.map((menu) => (
    //         <div key={menu.key} className="relative group">
    //           {/* Button */}
    //           <button
    //             className="flex items-center justify-between md:justify-start space-x-2 px-4 py-2 w-full md:w-auto text-gray-800 hover:text-primary focus:outline-none"
    //             onClick={() => handleToggle(menu.key)}
    //           >
    //             <menu.icon className="text-lg" />
    //             <span
    //               className={`${
    //                 isMenuOpen &&
    //                 openKey === menu.key &&
    //                 "text-primary font-semibold"
    //               }`}
    //             >
    //               {menu.label}
    //             </span>
    //             <span>
    //               {isMenuOpen && openKey === menu.key ? (
    //                 <FiChevronUp />
    //               ) : (
    //                 <FiChevronDown />
    //               )}
    //             </span>
    //           </button>

    //           {/* Dropdown */}
    //           {openKey === menu.key && (
    //             <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-48 bg-white border border-gray-300 shadow-md rounded-md z-50">
    //               {menu.items.map((item, index) => (
    //                 <a
    //                   key={index}
    //                   onClick={() => setIsMenuOpen(false)}
    //                   href="#"
    //                   className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
    //                 >
    //                   {item}
    //                 </a>
    //               ))}
    //             </div>
    //           )}
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </nav>

    <nav className="grainy-dark">
  {/* Mobile Hamburger Menu */}
  <div className="md:hidden px-4 py-3 flex items-center justify-between">
    <h1 className="text-lg font-semibold text-gray-800 animate-fade-in">Courses</h1>
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="focus:outline-none text-gray-800 hover:text-primary transition-transform duration-300 transform hover:rotate-90"
    >
      <FiMenu className="text-2xl" />
    </button>
  </div>

  {/* Navbar Items */}
  <div
    className={`${
      isMenuOpen ? "block animate-slide-down" : "hidden"
    } md:block w-full px-4 py-2`}
  >
    <div className="flex flex-col md:flex-row md:flex-wrap justify-center space-y-4 md:space-y-0 md:space-x-4">
      {navbarData.map((menu) => (
        <div key={menu.key} className="relative group cursor-pointer" onClick={()=>navigate('/courses',{state:{category:menu.key}})}>
          <span className="flex items-center justify-center md:justify-start space-x-2 px-4 py-2 w-full md:w-auto text-gray-800 font-semibold group-hover:text-primary transition-colors duration-300">
            <menu.icon className="text-lg group-hover:scale-125 transition-transform duration-300" />
            <span className="group-hover:underline group-hover:font-bold transition-all duration-300">
              {menu.label}
            </span>
          </span>
        </div>
      ))}
    </div>
  </div>
</nav>


  );
};

export default CourseNavbar;
