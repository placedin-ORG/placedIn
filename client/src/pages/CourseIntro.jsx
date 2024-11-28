import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {useSelector,useDispatch} from "react-redux";
import {
  FaClock,
  FaList,
  FaPhone,
  FaReceipt,
  FaShare,
  FaShieldAlt,
} from "react-icons/fa";
import Slider from "react-slick";
import { FaStar, FaRegStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "../component/Layout/Footer";
import API from "../utils/API";
import CourseCard from "../component/CourseCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { setCurrentCourse } from "../redux/UserSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '../component/Toast';
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-0 z-10 bg-black text-white p-2 rounded-full"
    style={{ transform: "translate(-50%, -50%)" }}
  >
    <FaArrowLeft />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-0 z-10 bg-black text-white p-2 rounded-full"
    style={{ transform: "translate(50%, -50%)" }}
  >
    <FaArrowRight />
  </button>
);
const CourseIntro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [relatedCourses,setRelatedCourses]=useState(null);
  const state=useSelector((state)=>state.user.currentCourse);
  const [start,setStart]=useState(false);
  const user = useSelector((state) => state);
  useEffect(() => {
    const call = async () => {
  console.log(user.user.user)
  console.log(state.user)
  if(user.user.user!==null){
    
    const data = await API.post("/learn/fetchCourse", {
        id,
        userId: user.user.user._id,
      });
         
      if (data.data.status) {
        setCourse(data.data.course);
        console.log(data.data.course)
        console.log(data.data.relatedCourses.length)
        if(data.data.relatedCourses.length!==0){
          setRelatedCourses(data.data.relatedCourses)
        }
         if(data.data.started){
          setStart(true);
         }
      }
  }else{
    const data = await API.post("/learn/fetchCourse", {
      id,
      userId: null,
    });
    if (data.data.status) {
      setCourse(data.data.course);
      console.log(data.data.course)
      console.log(data.data.relatedCourses.length)
      if(data.data.relatedCourses.length!==0){
        setRelatedCourses(data.data.relatedCourses)
      }
    }
  }
   
    };
    call();
  }, []);

  const startLearning = async() => {
   if(user.user.user===null){
    navigate('/register')
   }else if(course.price>0){
      toast.warning("this is a paid course");
   }else{
    const response = await API.post("/learn/startLearning", {
      _id:id,
      userId: user.user.user._id,
    });
    if (response.data.status) {
      dispatch(
        setCurrentCourse({
          course: response.data.updatedUse,
        })
      );
      // console.log(_id);
      // navigate(`/courseDetail/${_id}`)
    } else {
      alert("error");
      
    }
    navigate(`/courseDetail/${id}`);
   }
  
  };
  const settings = {
    dots: true, // Show pagination dots
    infinite: true, // Infinite loop scrolling
    speed: 500, // Animation speed
    slidesToShow: 3, // Number of slides to show
    slidesToScroll: 1, // Number of slides to scroll per click
    // arrows: true, // Show navigation arrows
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,

    responsive: [
      {
        breakpoint: 1024, // Below 1024px
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600, // Below 600px
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const [showMore, setShowMore] = useState(false);
  const maxDescriptionLength = 100; // Adjust as needed
  let truncatedDescription = "";
  let optimizedImage = "";
  if (course !== null) {
    truncatedDescription =
      course.description.length > maxDescriptionLength && !showMore
        ? `${course.description.substring(0, maxDescriptionLength)}...`
        : course.description;

    optimizedImage =
      course.courseThumbnail &&
      `${course.courseThumbnail}?w_800,h_600,c_fill,q_auto,f_auto`;
  }
  const calculateAverageRating = () => {
    if(course){
        if (course.rating.length === 0) return 0;
    const totalRating = course.rating.reduce((acc, cur) => acc + cur.rating, 0);
    return totalRating / course.rating.length;
    }
  
  };

  const averageRating = calculateAverageRating();
  return (
    <>
      <Navbar />
      <div className="bg-slate-50">
        <Toast/>
        {course && (
          <div>
            <div className="w-full flex flex-col lg:flex-row">
              {/* Text Section */}
              <div className="lg:w-5/6 w-full flex items-center justify-center py-5">

                <div className="px-5 lg:px-36 flex flex-col gap-3">
                  <p className="px-5 py-1 bg-green-100 text-green-500 rounded-2xl w-fit font-semibold">
                    Free Course
                  </p>
{/** Ratings */}
                  <div className="flex items-center space-y-4 justify-start    rounded-lg  w-full max-w-sm">
     
      <div className="flex   justify-start space-x-1">
        {Array.from({ length: 5 }).map((_, index) =>
          index < averageRating ? (
            <FaStar key={index} className="text-yellow-500 text-3xl" />
          ) : (
            <FaRegStar key={index} className="text-gray-400 text-3xl" />
          )
        )}
      </div>
    </div>
                  <h1 className="text-red-500 font-semibold text-3xl lg:text-5xl">
                    {course.title}
                  </h1>
                  <p className="text-base lg:text-lg font-semibold text-slate-600">
                    {truncatedDescription}
                    {course.description.length > maxDescriptionLength && (
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="text-red-500 light font-bold ml-2"
                      >
                        {showMore ? "See Less" : "See More"}
                      </button>
                    )}
                  </p>
                  <span className="text-red-500 text-sm lg:text-lg flex items-center gap-1 mt-3">
                    <FaClock /> :{" "}
                    <span className="text-slate-600 font-semibold">
  {course.examDuration >= 60
    ? `${Math.floor(course.examDuration / 60)} hours of learning`
    : `${course.examDuration} minutes of learning`}
</span>
                  </span>
                  <button
                    className="text-base lg:text-xl text-white bg-primary-light w-fit px-8 lg:px-16 rounded-xl py-1.5 font-semibold"
                    onClick={() => startLearning()}
                  >
                    {start ? "Continue Your Learning":" Start Learning"}
                   
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
                    course.courseThumbnail
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="px-14 mt-4 ">
              <p className="font-semibold">Key Highlights</p>
              <p className="text-3xl font-bold flex items-center gap-2 mt-2">
                What You will <span className="text-primary-light">Learn</span>
              </p>

              {/*
    what you will learn
    */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                {course.chapters.map((elem, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-300 flex p-10 rounded-xl hover:border-primary-dark hover:text-red-500 items-center justify-center font-semibold"
                  >
                    {elem.title}
                  </div>
                ))}
              </div>

              {/*
    certification
    */}
              <div className="px-5 lg:px-20 mt-7 py-5 rounded-3xl">
                <p className="font-mono text-lg lg:text-xl">CERTIFICATE</p>
                <h1 className="text-xl lg:text-3xl font-semibold">
                  <span className="text-primary-light">Earn and Share</span> Your
                  Certificate
                </h1>
                <div className="flex flex-col lg:flex-row mt-9 gap-6 lg:gap-11">
                  {/* Text Section */}
                  <div className="flex flex-col gap-4 lg:w-1/2">
                    {/* Official & Verifiable */}
                    <div className="flex gap-3">
                      <FaShieldAlt className="text-3xl lg:text-5xl text-primary-light" />
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-lg lg:text-2xl">
                          Official & Verifiable
                        </h1>
                        <p className="text-slate-600 text-sm lg:text-base">
                          Receive a signed and verifiable e-certificate from
                          upGrad upon successfully completing the course.
                        </p>
                      </div>
                    </div>

                    {/* Share Your Achievement */}
                    <div className="flex gap-3">
                      <FaShare className="text-3xl lg:text-5xl text-primary-light" />
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-lg lg:text-2xl">
                          Share Your Achievement
                        </h1>
                        <p className="text-slate-600 text-sm lg:text-base">
                          Post your certificate on LinkedIn or add it to your
                          resume! You can even share it on Instagram or Twitter.
                        </p>
                      </div>
                    </div>

                    {/* Stand Out to Recruiters */}
                    <div className="flex gap-3">
                      <FaReceipt className="text-3xl lg:text-5xl text-primary-light" />
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-lg lg:text-2xl">
                          Stand Out to Recruiters
                        </h1>
                        <p className="text-slate-600 text-sm lg:text-base">
                          Use your certificate to enhance your professional
                          credibility and stand out among your peers!
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
 {
  relatedCourses && (
    <div className="mt-10">
    <p className="text-sm font-mono tracking-wide text-gray-500 uppercase">
      Related Courses
    </p>
    <h1 className="text-4xl font-bold text-gray-800 leading-snug">
      <span className="text-primary-light">Learn More with </span> Similar Courses
    </h1>
    <div className="mt-12">
      <Slider {...settings} className="space-x-6">
        {relatedCourses?.map((course, index) => (
          <div
            key={index}
            className="   hover:shadow-xl transition duration-300 rounded-xl bg-white overflow-hidden"
          >
            <CourseCard course={course} />
          </div>
        ))}
      </Slider>
    </div>
  </div>
  
  )
 }
             
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CourseIntro;
