import { useEffect, useState } from "react";
import API from "../../../utils/API";
import toast from "react-hot-toast";
import InternCard from "./InternCard";
import {useSelector} from "react-redux";
const Internships=()=>{
    const user=useSelector((state)=>state.user.user);


    const [interData,setInternData]=useState(null);
    useEffect(()=>{
      const call=async()=>{
        try{
                const response=await API.post("/internship/get",{
                    user
                });
                
      if(response.status){
        setInternData(response.data.data);
      
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
    <div className="px-5">
        <h1 className="text-2xl">
            Internships
        </h1>
        <p className="text-gray-500">
        Find the Internships that fits your career aspirations.
        </p>

       {
        interData && interData.map((internship)=>{
            return <>
            <InternCard internship={internship}/>
            </>
        })
       }

    </div>
    </>
}
export default Internships;