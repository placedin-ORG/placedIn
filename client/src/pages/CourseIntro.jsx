import React, {useState, useEffect } from 'react';
import Navbar from '../component/Navbar';
import {useParams} from 'react-router-dom';
import {useNavigate} from 'react-router-dom'
import {FaClock,FaList,FaPhone, FaReceipt, FaShare, FaShieldAlt} from 'react-icons/fa'
import axios from 'axios'
import Footer from '../component/Layout/Footer';
const CourseIntro = () => {
    const navigate=useNavigate();
    const {id}=useParams();
    const [course,setCourse]=useState(null);
    useEffect(()=>{
        const call=async()=>{
              const data=await axios.post('http://localhost:5000/learn/fetchCourse',{
                id
              });
              if(data.data.status){
                setCourse(data.data.course);
              }
        }
        call()
    },[])

    const startLearning=()=>{
        navigate(`/courseDetail/${id}`)
    }

    const [showMore, setShowMore] = useState(false);
    const maxDescriptionLength = 100; // Adjust as needed
    let truncatedDescription="";
    let optimizedImage=""
  if(course!==null){
      truncatedDescription =
      course.description.length > maxDescriptionLength && !showMore
        ? `${course.description.substring(0, maxDescriptionLength)}...`
        : course.description;

         optimizedImage =
    course.courseThumbnail &&
    `${course.courseThumbnail}?w_800,h_600,c_fill,q_auto,f_auto`;
  }
   
  
  return (
    <>
      <Navbar/>
<div className='bg-slate-50'>

    {
        course && <div>
       <div className="w-full flex flex-col lg:flex-row">
      {/* Text Section */}
      <div className="lg:w-5/6 w-full flex items-center justify-center py-5">
        <div className="px-5 lg:px-36 flex flex-col gap-3">
          <p className="px-5 py-1 bg-green-100 text-green-500 rounded-2xl w-fit font-semibold">
            Free Course
          </p>
          <h1 className="text-red-600 font-semibold text-3xl lg:text-5xl">
            {course.title}
          </h1>
          <p className="text-base lg:text-lg font-semibold text-slate-600">
            {truncatedDescription}
            {course.description.length > maxDescriptionLength && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-red-500 font-bold ml-2"
              >
                {showMore ? "See Less" : "See More"}
              </button>
            )}
          </p>
          <span className="text-red-500 text-sm lg:text-lg flex items-center gap-1 mt-3">
            <FaClock /> :{" "}
            <span className="text-slate-600 font-semibold">
              9 hours of learning
            </span>
          </span>
          <button
            className="text-base lg:text-xl text-white bg-red-500 w-fit px-8 lg:px-16 rounded-xl py-1.5 font-semibold"
            onClick={() => startLearning()}
          >
            Continue Learning
          </button>
          <p className="font-semibold text-slate-600 flex gap-1 items-center text-sm lg:text-base">
            <FaPhone /> For enquiry call: 91XXXXXXXXXX
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden lg:block lg:w-1/2 pr-5">
        <div className="h-96 w-full overflow-hidden rounded-r-3xl">
          <img
            src={
              optimizedImage ||
              "https://via.placeholder.com/800x600?text=No+Image+Available"
            }
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

        <div className='px-14 mt-4 '>
            <p className='font-semibold'>Key Highlights</p>
            <p className='text-3xl font-bold flex items-center gap-2 mt-2'>What You will <span className='text-red-500'>Learn</span></p>

   {
    /*
    what you will learn
    */
   }
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
  {course.chapters.map((elem, index) => (
    <div
      key={index}
      className="border-2 border-gray-300 flex p-10 rounded-xl hover:border-red-500 hover:text-red-500 items-center justify-center font-semibold"
    >
      {elem.title}
    </div>
  ))}
</div>


{
    /*
    certification
    */
}
<div className="px-5 lg:px-20 mt-7 py-5 rounded-3xl">
  <p className="font-mono text-lg lg:text-xl">CERTIFICATE</p>
  <h1 className="text-xl lg:text-3xl font-semibold">
    <span className="text-red-500">Earn and Share</span> Your Certificate
  </h1>
  <div className="flex flex-col lg:flex-row mt-9 gap-6 lg:gap-11">
    {/* Text Section */}
    <div className="flex flex-col gap-4 lg:w-1/2">
      {/* Official & Verifiable */}
      <div className="flex gap-3">
        <FaShieldAlt className="text-3xl lg:text-5xl text-red-500" />
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg lg:text-2xl">Official & Verifiable</h1>
          <p className="text-slate-600 text-sm lg:text-base">
            Receive a signed and verifiable e-certificate from upGrad upon successfully completing the course.
          </p>
        </div>
      </div>

      {/* Share Your Achievement */}
      <div className="flex gap-3">
        <FaShare className="text-3xl lg:text-5xl text-red-500" />
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg lg:text-2xl">Share Your Achievement</h1>
          <p className="text-slate-600 text-sm lg:text-base">
            Post your certificate on LinkedIn or add it to your resume! You can even share it on Instagram or Twitter.
          </p>
        </div>
      </div>

      {/* Stand Out to Recruiters */}
      <div className="flex gap-3">
        <FaReceipt className="text-3xl lg:text-5xl text-red-500" />
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg lg:text-2xl">Stand Out to Recruiters</h1>
          <p className="text-slate-600 text-sm lg:text-base">
            Use your certificate to enhance your professional credibility and stand out among your peers!
          </p>
        </div>
      </div>
    </div>

    {/* Image Section */}
    <div className="hidden lg:block lg:w-1/2">
      <img
        src="https://th.bing.com/th/id/OIP.rxDrB65ZGXpz6L5nE22ecAHaFP?w=249&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7"
        className="w-full rounded-xl"
        alt="Certificate Preview"
      />
    </div>
  </div>
</div>



{/**
 Similar Courses
 */}
 <div className='mt-10'>
    <p className='font-mono'>RELATED COURSES</p>
    <h1 className='text-3xl font-semibold'><span className='text-red-500'>Learn More with </span> Similar Courses</h1>
    <div className='bg-white flex items-center justify-center p-10 text-4xl'>
    Similar courses goes here
    </div>
    </div>
        </div>
        </div>
    }
</div>
<Footer/> 
    </>
  );
}

export default CourseIntro;
