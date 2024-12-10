import React,{useState,useEffect} from 'react';
import { useSelector } from "react-redux";
import API from "../../utils/API";
import { FaShieldAlt } from "react-icons/fa";
const ProfileModel = ({setShowModal,userId}) => {
  const [userData,setUserData]=useState(null);
  const [league, setLeague] = useState(null);
    useEffect(()=>{
    const call=async()=>{
        try{
       const data=await API.post("/ranking/profileData",{
        userId
       })
       console.log(data.data.profileData)
        if(data.data.status){
            const total = data.data.profileData.completedCoursesCount + data.data.profileData.resultCount;
            setUserData(data.data.profileData);
            if (total <= 30) setLeague("Bronze");
          else if (total <= 70) setLeague("Silver");
          else setLeague("Gold");
        }
        }catch(err){
            console.log(err.message);
        }
    }
    call();
    },[])

    const getLeagueColor = () => {
        if (league === "Bronze") return "text-yellow-700 border-yellow-500";
        if (league === "Silver") return "text-gray-400 border-gray-400";
        if (league === "Gold") return "text-yellow-500 border-yellow-700";
        return "text-gray-300 border-gray-300";
      };
      
  return (
    <>{
        userData &&  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[95%] relative shadow-xl">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
            <div className="flex justify-between items-start mb-6 px-4">
        <div >           
        <img
                    src={userData.avatar} // Fallback if no image
                    alt={`${userData.username}'s Profile`}
                    className="w-24 h-24 rounded-full border-4 border-yellow-500 mb-4 transform transition-all duration-300 hover:scale-125"
                  />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          
            <span className="block sm:inline text-primary font-mono tracking-widest">
              {userData.username}
            </span>
          </h1>
          <div className='flex gap-2'>
 <p className="text-sm font-semibold text-gray-500">
            {userData.email}
          </p>

          <div className="   flex flex-col items-center">
      <FaShieldAlt
        className={`text-3xl ${getLeagueColor()} mb-4 animate-jump-and-flip`}
      />
      
   
    </div>

          </div>
         
        </div>
        
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-blue-500 text-4xl">📘</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Completed Courses
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.completedCoursesCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-green-500 text-5xl">🎓</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Exams Attempted
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.resultCount}
              </h3>
            </div>
          </div>
        </div>
      </div>
          </div>
        </div>
    }
     
    </>
  );
}

export default ProfileModel;
