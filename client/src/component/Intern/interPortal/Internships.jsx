import { useEffect, useState } from "react";
import API from "../../../utils/API";
import toast from "react-hot-toast";
import InternCard from "./InternCard";
import {useSelector} from "react-redux";
const Internships=()=>{
    const user=useSelector((state)=>state.user.user);
    const [visibleCount, setVisibleCount] = useState(15); // State to manage visible internships

    const showMore = () => {
      setVisibleCount(visibleCount + 15); // Increase the count by 15 when "Show More" is clicked
    };

    const [interData,setInternData]=useState(null);
    const [studentData,setStudentData]=useState(null);
    useEffect(()=>{
      const call=async()=>{
        try{
            console.log(user._id)
                const response=await API.post("/internship/get",{
                    user
                });
                
      if(response.status){
        if(user){
            setInternData(response.data.data);
            setStudentData(response.data.studentInternship);
            console.log(response.data.studentInternship)
        }else{
            setInternData(response.data.data);
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
    <div className="px-5 py-10  ">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-start mb-8 border-3" >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Internships</h1>
        <p className="text-gray-600 mt-2">
          Find the internships that fit your career aspirations and help you grow.
        </p>
      </div>

      {/* Internships Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
        {interData &&
          interData.slice(0, visibleCount).map((internship, index) => (
            <InternCard
              key={index}
              internship={internship}
              studentData={studentData}
            />
          ))}
      </div>

      {/* Show More Button */}
      {interData && visibleCount < interData.length && (
        <div className="text-center mt-8">
          <button
            onClick={showMore}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Show More Internships
          </button>
        </div>
      )}
    </div>
    </>
}
export default Internships;