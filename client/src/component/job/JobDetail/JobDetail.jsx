import { useLocation ,useNavigate} from "react-router-dom";
import Navbar from "../../Navbar";
import { AiOutlineHeart, AiOutlineShareAlt } from "react-icons/ai";
import parse from "html-react-parser";
import ApplyJob from "../../model/ApplyJob";
import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import API from "../../../utils/API";
const JobDetail=()=>{
    const navigate=useNavigate();
    const [model,setModel]=useState(false);
   const user=useSelector((state)=>state.user.user);
    const location = useLocation();
    const { job,enrolled } = location.state || {}; 
     
    useEffect(()=>{
        if(user!==null){
          const call=async()=>{
            await API.post("/job/IncreaseView",{
                studentId:user._id,
                jobId:job._id
            })
            return ;
          }
          call();
        }
       },[])
    return <>
    <Navbar/>
    <div className="min-h-screen flex flex-col md:flex-row   bg-green-100">
      {/* Left Side */}
      <div className="flex-1 p-6  mt-80 md:mt-0 border-l-4 border-green-500">
        <div className="max-w-3xl mx-auto  rounded-md p-6">
          <img
            src={job.thumbnail}
            alt={job.title}
            className="w-full h-60 object-cover border-l-4 border-green-500 rounded-md"
          />
          <h1 className="text-2xl font-bold mt-4">{job.title}</h1>
          <p className="text-gray-600 mt-2">{parse(job.description)}</p>

          <div className="mt-4">
            <h2 className="text-lg font-semibold">Who is Eligible?</h2>
            <p className="text-gray-700 mt-1">{parse(job.whoEligible)}</p>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold">Company</h2>
            <div className="flex items-center mt-1">
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-10 h-10 object-cover rounded-full"
              />
              <span className="ml-2 text-gray-700">{job.companyName}</span>
            </div>
          </div>

       
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-72 md:bg-gray-50 bg-green-100  md:shadow-md p-6 fixed right-0 mr-0 md:mt-6 md:mr-4    flex flex-col items-center">
        <div className="flex gap-3"> <button className="mb-4 text-gray-600 hover:text-red-600">
          <AiOutlineHeart size={28} />
          
        </button>
        <button className="mb-4 flex items-center gap-3 border-2 rounded-md hover:border-green-300 pr-5  text-gray-600 hover:text-green-600 py-1">
          <AiOutlineShareAlt size={28} />
        share
        </button></div>
       {
        user===null ?    <button className="mt-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700" onClick={()=>navigate("/login")}>
        Login And Apply
      </button> :     <button className="mt-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700" disabled={enrolled}  onClick={()=>setModel(true)}>
         {enrolled ? 'Applied':'Quick Apply'} 
        </button>
       }
    
        <div className="mt-4 px-5 pb-3 rounded-md bg-green-100">
        <div className="mt-4 ">
            <h2 className="text-lg font-semibold">Other Information</h2>
            <p className="text-gray-700 mt-1">Maximum Applicants: {job.maximumApplicant}</p>
            <p className="text-gray-700">Closing Time: {new Date(job.closingTime).toLocaleString()}</p>
            <p className="text-gray-700">Views: {job.view}</p>
            <p className="text-gray-700">Applications: {job.studentApplied}</p>
          </div>
        </div>
      </div>
    </div>

    {
    model && <ApplyJob jobId={job._id} studentId={user._id} teacherId={job.teacherId} setModel={setModel}/>
    }
    </>
}

export default JobDetail;