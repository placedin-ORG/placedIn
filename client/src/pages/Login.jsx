import React from 'react';
import {useState} from 'react'
import {setLogin} from "../redux/UserSlice";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from "../component/Toast"
import Model from "../component/Model"
import axios from "axios"
const Login = () => {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const dispatch=useDispatch();
  const [model,setModel]=useState(false)
  const navigate=useNavigate();
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setModel(true);
    try{
      const response=await axios.post("http://localhost:5000/auth/login",{
        email,password
      })
     setModel(false)
     console.log(response)
     if(response.data.status){
      dispatch(
        setLogin({
          user:response.data.user,
        })
      )
      navigate('/')
     }else{
      toast.error(response.message);
     }
    }catch(err){
      toast.error(err);
      console.log(err);
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toast/>
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg border border-gray-300 border-opacity-30 animate-slide-in-left">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-200">Login</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4 animate-slide-in-right delay-300">
            <label className="block text-gray-200">Email</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
              placeholder="Enter Email"
              type="email"
              name="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4 animate-slide-in-right delay-400">
            <label className="block text-gray-200">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
              name="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>
          

          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-red-600 bg-opacity-90 text-white py-2 rounded-lg"
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-center">
          <span className="text-gray-200">Don't Have an Account? </span>
          <button className="text-red-400" onClick={()=>navigate("/register")}>Register</button>
        </div>
      </div>
      {
        model ? <Model/> : null
      }
    </div>
  );
}

export default Login;
