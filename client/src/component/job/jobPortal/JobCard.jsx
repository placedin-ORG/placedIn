import { useEffect,useState } from "react";
import { FaEye, FaCheck, FaArrowRight } from "react-icons/fa";
import {useNavigate} from "react-router-dom";
const formatTimeLeft = (closingTime) => {
    const now = new Date();
    const closingDate = new Date(closingTime);
    const diff = closingDate - now; // Difference in milliseconds
  
    if (diff <= 0) return "Closed";
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
  
    if (years > 0) return `${years} year${years > 1 ? "s" : ""} left`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} left`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
    return `${seconds} second${seconds > 1 ? "s" : ""} left`;
  };
const JobCard=({job,studentData})=>{
    const navigate=useNavigate();
    const [enrolled,setEnrolled]=useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(()=>{
      if(studentData){
        console.log(studentData)
        const isIdPresent = studentData.some(item => item.job === job._id);
        if(isIdPresent){
            setEnrolled(true);
        }

    }
    setTimeLeft(formatTimeLeft(job.closingTime));
    },[])
    const onApply=()=>{
     navigate("/jobDetail",{state:{job,enrolled}});
    }
    return <>
    {
      timeLeft ==="Close"?null: <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* Thumbnail */}
      <div className="relative w-full ">
        <img
          src={job.thumbnail}
          alt={`${job.title} thumbnail`}
          className="w-full h-50 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent  group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-4 flex items-center justify-between text-white">
            <span className="flex items-center space-x-1">
              <FaEye />
              <span>{job.view} views</span>
            </span>
            {enrolled &&  (
              <span className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full text-sm">
                <FaCheck />
                <span>Applied</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{job.title}</h3>
        <p className="text-gray-500">{job.companyName}</p>
        <p className="text-gray-600">closing on:<span className="text-gray-500">{timeLeft}</span> </p>
        <div className="mt-4">
          <button
            onClick={onApply}
            className="w-full flex items-center justify-center space-x-2 border-2 border-green-400 hover:border-none text-black hover:text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            <span>{enrolled ? <span className="flex gap-1 items-center text-green-300">Applied  <FaCheck /></span>:<span className="flex gap-1 items-center">Apply    <FaArrowRight /></span>}</span>
         
          </button>
        </div>
      </div>
    </div>
    }

    </>
}
export default JobCard;