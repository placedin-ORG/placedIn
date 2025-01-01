import {useNavigate} from "react-router-dom";
import {
    FaGraduationCap,
    FaRobot,
    FaBriefcase,
    FaDatabase,
  } from "react-icons/fa";
const InternCategory=()=>{
    const navigate=useNavigate();
    const navbarData = [
      {
        key: "doctorate",
        icon: FaGraduationCap,
        label: "Doctorate",
        color: "bg-[#FFE9E8]",
      },
      {
        key: "aiml",
        icon: FaRobot,
        label: "AIML",
        color:"bg-[#EBE8FD]"
      },
      {
        key: "mba",
        icon: FaBriefcase,
        label: "MBA",
        color:"bg-[#DDEDFF]"
      },
      {
        key: "dataScience",
        icon: FaDatabase,
        label: "Data Science",
       color:"bg-[#E6FFF5]"
      },
      {
        key: "marketing",
        icon: FaDatabase,
        label: "Marketing",
        color:"bg-[#FFEEE0]"
      },
      {
        key: "software",
        icon: FaDatabase,
        label: "Software & Tech",
        color:"bg-[#DDEDFF]"
      },
      {
        key: "management",
        icon: FaDatabase,
        label: "Management",
        color:"bg-[#E6FFF5]"
      },
      {
        key: "law",
        icon: FaDatabase,
        label: "Law",
       color:"bg-[#FFE9E8]"
      },
    ];
return <>
<div className="flex flex-col md:flex-row pl-2 md:pl-10  gap-2 p-5  rounded-lg ">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">Internship Categories</h2>
  </div>
  <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-4">
    {navbarData.map((category, index) => (
      <div
        key={index}
        className="p-2 flex items-center gap-1 text-center bg-white rounded-lg border hover:border-green-400 hover:shadow-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
      >
        <div className={` px-3 py-3 rounded-full ${category.color} `}>
          <category.icon className="border-1"/>  
            </div>
        
        <span className="text-[89%] font-medium text-gray-700">{category.label}</span>
      </div>
    ))}
  </div>
</div>

</>
}
export default InternCategory;