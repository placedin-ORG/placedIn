import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import {useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from "../component/Toast";
import Model from "../component/Model";
import axios from "axios"
const Register = () => {
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [model,setModel]=useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'profileImage' ? files[0] : value,
    });
  };

 const handleSubmit=async(e)=>{
  e.preventDefault();
  setModel(true);
  try{
//    const register_form=new FormData();

//    for(var key in formData){
//     register_form.append(key,formData[key])
//     console.log(formData[key]);
//    }

   const response=await axios.post('http://localhost:5000/create/register',{
     name:formData.name,
     email:formData.email,
     password:formData.password
   })
   setModel(false)
   if(response.data.status){
     navigate('/login');
   }else{
    toast.error("Some Feild is empty")
   }
  }catch(err){ 
    toast.error(err)
   console.log("registration failed",err);
  }
 }
 const [isFormVisible, setIsFormVisible] = useState(false);
 React.useEffect(() => {
  const timer = setTimeout(() => {
    setIsFormVisible(true);
  }, 500); // Delay matching the form slide-in duration
  return () => clearTimeout(timer);
}, []);

// const convertToBase64 = async (e) => {
//   const { name, files } = e.target; // Extract 'name' and 'files' from event target
//   const reader = new FileReader();

//   console.log(1);
//   reader.readAsDataURL(files[0]);

//   reader.onload = () => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: name === 'profileImage' ? reader.result : e.target.value,
//     }));
//   };
  

//   reader.onerror = (err) => {
//     console.log(err);
//   };
// };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    {/* Background blur */}
    <Toast/>
    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm"></div>
    
    {/* Form container sliding in from the left */}
    <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg border border-gray-300 border-opacity-30 animate-slide-in-left">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-200">Sign Up</h2>
      
      <form onSubmit={handleSubmit}> 
        {isFormVisible && ( // Render content only after sliding in
          <>
            <div className="mb-4 animate-bounce-in delay-100">
              <label className="block text-gray-200">Name</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
                placeholder="Enter Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4 animate-bounce-in delay-200">
              <label className="block text-gray-200">Email</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
                placeholder="Enter Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4 animate-bounce-in delay-300">
              <label className="block text-gray-200">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            {/* <div className="flex flex-col justify-center items-center mb-2 animate-bounce-in delay-400">
              <input
                type="file"
                accept="image/*"
                id="image"
                className="hidden"
                name="profileImage"
                onChange={(e)=>convertToBase64(e)}
              />
              <label
                htmlFor="image"
                className="flex flex-col justify-center items-center gap-2 cursor-pointer"
              >
                <FaUpload />
                <p>Upload your image</p>
              </label>

              {formData.profileImage && (
                <img
                  src={formData.profileImage}
                  className="w-16 h-16 mt-2 rounded-md"
                />
              )}
            </div> */}

            <div className="mb-4 animate-bounce-in delay-500">
              <button
                type="submit"
                className="w-full bg-red-600 bg-opacity-90 text-white py-2 rounded-lg"
              >
                Sign Up
              </button>
            </div>

            <div className="text-center animate-bounce-in delay-600">
              <span className="text-gray-200">Already Have an Account? </span>
              <button className="text-red-400" onClick={()=>navigate("/login")}>Log In</button>
            </div>
          </>
        )}
      </form>
    </div>
{
  model ? <Model/> : null
}
  </div>
  
    </>
    
  );
};

export default Register;
