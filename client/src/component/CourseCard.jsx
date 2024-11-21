import React, { useEffect,useState } from 'react';
import {useSelector,useDispatch} from 'react-redux';
import axios from 'axios'
import {setCurrentCourse} from '../redux/UserSlice';
import {useNavigate} from "react-router-dom"
const CourseCard = () => {
  const navigate=useNavigate();
  const user=useSelector((state)=>state);
  const [courses,setCourses]=useState([]);
  const dispatch=useDispatch();
useEffect(()=>{
  // console.log(user.user)
 const call=async ()=>{
const data=await axios.get("http://localhost:5000/create/getCourses");
console.log(data)
setCourses(data.data.courses);

 }
 call();
},[]);

const startLearning=async(_id,title)=>{
  try{
    console.log(user.user.user)
 const response=await axios.post("http://localhost:5000/learn/startLearning",{
    _id,
    userId:user.user.user._id
  });
// console.log(response.data.user)
  if(response.data.status){
    dispatch(
    setCurrentCourse({
      course: response.data.updatedUse
    })
    )
    console.log(_id)
    navigate(`/intro/course/${_id}`)
    // navigate(`/courseDetail/${_id}`)
  }else{
    alert("error")
  }
  }catch(err){
    console.log(err)
  }
 
}
  return (
    <>
      {
        courses.length===0?null:<div>
          {
            courses.map((course,index)=>{
              return <>
              <h1>{course.title}</h1>
              <button onClick={()=>startLearning(course._id,course.title)}>Start learning</button>
              </>
            })
          }
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
