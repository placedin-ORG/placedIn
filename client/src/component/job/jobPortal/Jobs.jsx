import { useEffect, useState } from "react";
import API from "../../../utils/API";
import toast from "react-hot-toast";
import JobCard from "./JobCard";
import {useSelector} from "react-redux";
const Jobs=()=>{
    const user=useSelector((state)=>state.user.user);
    const [visibleCount, setVisibleCount] = useState(15); // State to manage visible jobs

    const showMore = () => {
      setVisibleCount(visibleCount + 15); // Increase the count by 15 when "Show More" is clicked
    };

    const [jobData,setJobData]=useState(null);
    const [studentData,setStudentData]=useState(null);
    useEffect(()=>{
      const call=async()=>{
        try{
            console.log(user._id)
                const response=await API.post("/job/get",{
                    user
                });
                
      if(response.status){
        if(user){
            setJobData(response.data.data);
            setStudentData(response.data.studentJob);
            console.log(response.data.studentJob)
        }else{
            setJobData(response.data.data);
        }
        
      
      }else{
        toast.error(response.data.message)
      }
        }catch(err){
   toast.error(err.message);
        }
   
      }
      call();
    },[])
    return <>
    <div className="px-5 py-10 min-h-screen">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-start mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Jobs</h1>
        <p className="text-gray-600 mt-2">
          Find the Jobs that fit your career aspirations and help you grow.
        </p>
      </div>

      {/* Job Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
        {jobData &&
          jobData.slice(0, visibleCount).map((job, index) => (
            <JobCard
              key={index}
              job={job}
              studentData={studentData}
            />
          ))}
      </div>

      {/* Show More Button */}
      {jobData && visibleCount < jobData.length && (
        <div className="text-center mt-8">
          <button
            onClick={showMore}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Show More Jobs
          </button>
        </div>
      )}
    </div>
    </>
}
export default Jobs;