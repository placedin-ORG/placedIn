import React, { useEffect,useState } from 'react';
import toast from 'react-hot-toast'
import API from '../../utils/API';
import {useSelector} from 'react-redux';
import { FaBriefcase } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import {useNavigate} from 'react-router-dom'
import Navbar from '../../component/Navbar';
const Notification = () => {
    const navigate=useNavigate();
    const user=useSelector((state)=>state.user.user);
    const [notifications,setNotification]=useState([]);
    useEffect(()=>{
        const call=async()=>{
  try{
    console.log(user._id)
        const response=await API.post("/notification/getNotifications",{
            userId:user._id
        });
        if(response.status){
            console.log(response)
            setNotification(response.data.notifications);
        }else{
            toast.error(response.data,message);
        }
      }catch(err){
        toast.error(err.message);
      }
        }
        if(user!==null){
        call()
        }
     
    },[]);

    const handleView=async(internshipId,type)=>{
try{
  const response=await API.post("/notification/viewNotification",{
    user,
    _id:internshipId,
    type
  })
  if(response.data.status){
    let enrolled=false;
    if(user!==null){
        const isIdPresent = response.data.studentInternship.some(item => item.internship === internshipId);
        
        if(isIdPresent){
           enrolled=true;
        }
        navigate("/internshipDetail",{state:{internship:response.data.data,enrolled}})
    }else{
        navigate("/internshipDetail",{state:{internship:response.data.data,enrolled}})
    }
  }else{
    toast.error(response.data.message);
  }
}catch(err){
    toast.error(err.message)
}
    }
    return (
        <>
        <Navbar/>
         <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">New updates</h1>
        {
            notifications.length!==0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifications.map((notification) => (
                <div 
                    key={notification.id} 
                    className="bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border border-gray-200 transition-transform hover:scale-105"
                    onClick={()=>handleView(notification.id,notification.type)}
                >
                    <img 
                        src={notification.companyLogo} 
                        alt={notification.companyName} 
                        className="w-16 h-16 object-contain rounded-full"
                    />
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FaBriefcase className="text-blue-500" /> {notification.companyName}
                        </h2>
                        <p className="text-sm text-gray-600"> {notification.companyName} {notification.message}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {notification.category.map((cat, index) => (
                                <span 
                                    key={index} 
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt))} ago
                        </p>
                    </div>
                </div>
            ))}
        </div> : <div>Hmm ,it seems like you haven't {user===null ? "register yet! Register Now to get all the notifications": "selected any internset! select the interest from the prfile section and start getting notifications"}</div>
        }
       
    </div>
        </>
       
    );
};

export default Notification;
