import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useRazorpay } from "react-razorpay";
import Review from "../pages/Review"
import {
  FaClock,
  FaList,
  FaPhone,
  FaReceipt,
  FaShare,
  FaShieldAlt,
} from "react-icons/fa";
import { BsFillPersonFill } from "react-icons/bs"
import Slider from "react-slick";
import { FaStar, FaRegStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "../component/Layout/Footer";
import API from "../utils/API";
import CourseCard from "../component/CourseCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { setCurrentCourse } from "../redux/UserSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../component/Toast";
import Skeleto from "../component/loading/SkeletonLoading";
import { tst } from "../utils/utils";
import { FaAngleDown, FaAngleUp, FaLock, FaLockOpen, FaCheckCircle } from "react-icons/fa";
import formatSecondsToHMS from "../utils/durationHelper";

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
  const [relatedCourses, setRelatedCourses] = useState(null);
  const state = useSelector((state) => state.user.currentCourse);
  const [start, setStart] = useState(false);
  const user = useSelector((state) => state);
  const { error, isLoading, Razorpay } = useRazorpay();
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    const call = async () => {
      console.log(user.user.user);
      if (user.user.user !== null) {
        const data = await API.post("/learn/fetchCourse", {
          id,
          userId: user.user.user._id,
        });
        if (data.data.status) {
          setCourse(data.data.course);
          console.log("fetches course data", data.data.course);
          console.log(data.data.relatedCourses.length);
          if (data.data.relatedCourses.length !== 0) {
            setRelatedCourses(data.data.relatedCourses);
          }
          if (data.data.started) {
            setStart(true);
          }
        }
      } else {
        const data = await API.post("/learn/fetchCourse", {
          id,
          userId: null,
        });
        if (data.data.status) {
          setCourse(data.data.course);
          console.log(data.data.course);
          console.log(data.data.relatedCourses.length);
          if (data.data.relatedCourses.length !== 0) {
            setRelatedCourses(data.data.relatedCourses);
          }
        }
      }
    };
    call();
  }, []);

  const handlePayment = async (address = "") => {
    const options = {
      key: import.meta.env.VITE_APP_RAZOR_API_KEY,
      amount: Math.ceil(course.price - course.discountAmount) * 100,
      currency: "INR",
      name: "PlacedIn",
      description: "Test Transaction",
      image:
        "https://s3.ap-south-1.amazonaws.com/assets.ynos.in/startup-logos/YNOS382149.jpg",
      handler: async (res) => {
        const payload = {
          course: course._id,
          user: user.user.user._id,
          purchaseFor: "Course",
          paymentId: res.razorpay_payment_id,
          amount: course.price - course.discountAmount,
          success: true,
        };
        await handlePurchase(payload);
        await handleEnroll();
        toast.success("Payment successful");
      },
      prefill: {
        name: user?.user?.name,
        email: user?.user?.email,
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzpay = new Razorpay(options);
    rzpay.on("payment.failed", async function (response) {
      const payload = {
        course: course._id,
        user: user.user.user._id,
        purchaseFor: "Course",
        paymentId: response.error.metadata.payment_id,
        amount: course.price - course.discountAmount,
        success: false,
      };
      await handlePurchase(payload);
      toast.error("Payment falied \n Error Code: " + response.error.code);
    });
    rzpay.open();
  };

  const startLearning = async () => {
    if (user.user.user === null) {
      navigate("/register");
    } else if (!start && course.price > 0) {
      await handlePayment();
    } else {
      await handleEnroll();
    }
  };

  const handlePurchase = async (payload) => {
    try {
      const { data } = await API.post("/purchase/create", payload);
      console.log(data);
      tst.success("Purchase info saved");
    } catch (error) {
      tst.error(error);
    }
  };

  const handleEnroll = async () => {
    try {
      if (!start) {
        const response = await API.post("/learn/startLearning", {
          _id: id,
          userId: user.user.user._id,
        });
        dispatch(
          setCurrentCourse({
            course: response.data.updatedUse,
          })
        );
      }
      navigate(`/courseDetail/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [showMore, setShowMore] = useState(false);
  const maxDescriptionLength = 250;
  let truncatedDescription = "";
  let optimizedImage = "";
  if (course !== null) {
    console.log(course.courseThumbnail)
    truncatedDescription =
      course.description.length > maxDescriptionLength && !showMore
        ? `${course.description.substring(0, maxDescriptionLength)}...`
        : course.description;
    optimizedImage =
      course.courseThumbnail &&
      `${course.courseThumbnail}?w_800,h_600,c_fill,q_auto,f_auto`;
  }

  const calculateAverageRating = () => {
    if (course) {
      if (course.reviews?.length === 0) return 0;
      const totalRating = course.reviews?.reduce(
        (acc, cur) => acc + cur.rating,
        0
      );
      return totalRating / course.reviews?.length;
    }
  };

  const averageRating = calculateAverageRating();

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters(prev => ({ ...prev, [chapterIndex]: !prev[chapterIndex] }));
  };

  const getEmbedUrl = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId =
        url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("drive.google.com")) {
      const fileId = url.split("d/")[1].split("/")[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  };

  return (
    <>
      <Navbar />
      {course === null ? (
        <Skeleto />
      ) : (
        <div className="bg-slate-50">
          <Toast />
          {course && (
            <div>
              {/* Hero Section - Made Responsive */}
              <div className="w-full flex flex-col-reverse lg:flex-row">
                {/* Text Section */}
                <div className="lg:w-5/6 w-full flex items-center py-5 px-4 sm:px-6 lg:px-8 xl:px-36">
                  <div className="w-full flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="px-4 sm:px-5 py-1 bg-green-100 text-green-500 rounded-2xl w-fit font-semibold text-sm sm:text-base">
                        {course.price > 0 ? (
                          <span className="flex items-center justify-center gap-2 sm:gap-5">
                            <span>₹{course.price - course.discountAmount}</span>
                          </span>
                        ) : (
                          "Free Course"
                        )}
                      </p>
                      {course.discountAmount > 0 && (
                        <p className="text-gray-600 line-through text-sm sm:text-base">
                          ₹{course.price}
                        </p>
                      )}
                    </div>

                    {/** Ratings - Made Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center justify-start space-x-1">
                        <p className="text-yellow-600 font-semibold text-sm sm:text-base">
                          {averageRating.toFixed(1)}
                        </p>
                        {Array.from({ length: 5 }).map((_, index) =>
                          index < averageRating ? (
                            <FaStar
                              key={index}
                              className="text-yellow-500 text-lg sm:text-xl"
                            />
                          ) : (
                            <FaRegStar
                              key={index}
                              className="text-gray-400 text-lg sm:text-xl"
                            />
                          )
                        )}
                        <p className="font-semibold text-green-500 text-sm sm:text-base ml-1 sm:ml-2">
                          ({course.reviews?.length} rating)
                        </p>
                      </div>
                      <p className="pl-0 sm:pl-2 font-medium text-gray-700 text-sm sm:text-base">
                        {course.studentEnrolled} students enrolled
                      </p>
                    </div>

                    <h1 className="text-red-500 font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                      {course.title}
                    </h1>

                    <span className="text-red-500 text-sm sm:text-base lg:text-lg flex items-center gap-1 mt-2 sm:mt-3">
                      <FaClock /> :{" "}
                      <span className="text-slate-600 font-semibold">
                        {course.examDuration >= 60
                          ? `${Math.floor(course.examDuration / 60)} hours of learning`
                          : `${course.examDuration} minutes of exam`}
                      </span>
                    </span>

                    <button
                      className="text-base sm:text-lg lg:text-xl text-white bg-primary-light w-full sm:w-fit px-6 sm:px-8 lg:px-16 rounded-xl py-2 sm:py-1.5 font-semibold mt-2 sm:mt-0"
                      onClick={() => startLearning()}
                    >
                      {start ? "Continue Your Learning" : "Enroll"}
                    </button>

                    <p className="font-semibold text-slate-600 flex gap-1 items-center text-sm sm:text-base lg:text-base mt-2">
                      <FaPhone /> For enquiry call: 91XXXXXXXXXX
                    </p>
                  </div>
                </div>

                {/* Image Section - Made Responsive */}
                <div className="lg:w-1/2 w-full px-4 sm:px-6 lg:px-0 lg:pr-5">
                  <div className="h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-xl lg:rounded-r-3xl">
                    <img
                      src={course.courseThumbnail}
                      className="w-full h-full object-cover"
                      alt={course.title}
                    />
                  </div>
                </div>
              </div>

              {/* Main Content - Made Responsive */}
              <div className="px-4 sm:px-6 lg:px-8 xl:px-14 mt-4 sm:mt-6">
                <p className="font-semibold text-sm sm:text-base">Key Highlights</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 mt-2">
                  What You will{" "}
                  <span className="text-primary-light">Learn</span>
                </p>

                {/* Course Content Sidebar Preview - Made Responsive */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg sm:rounded-xl">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Course Content</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {course.chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapterIndex}
                        className="border-b border-gray-200 last:border-b-0 pb-2 sm:pb-3"
                      >
                        <div
                          className="flex justify-between items-center p-2 sm:p-3 cursor-pointer group hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => toggleChapter(chapterIndex)}
                        >
                          <div className="flex flex-col">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-primary-dark">
                              {chapter.title}
                            </h3>
                            <span className="text-xs text-gray-500 mt-1">
                              {chapter.topics.length} lectures
                            </span>
                          </div>
                          <button className="text-gray-500 group-hover:text-primary-dark focus:outline-none">
                            {expandedChapters[chapterIndex] ? (
                              <FaAngleUp />
                            ) : (
                              <FaAngleDown />
                            )}
                          </button>
                        </div>
                        {expandedChapters[chapterIndex] && (
                          <div className="pl-2 sm:pl-3 mt-2 space-y-1 sm:space-y-2">
                            {chapter.topics.map((topic, topicIndex) => {
                              const isCompleted = false;
                              const isLocked = false;
                              return (
                                <div
                                  key={topicIndex}
                                  className={`flex items-center justify-between p-2 sm:p-3 rounded-md transition-all duration-200 ${
                                    isLocked
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : isCompleted
                                      ? "bg-white text-gray-500"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <div className="flex items-center text-black space-x-2">
                                    <span
                                      className={`text-xs sm:text-sm ${
                                        isCompleted ? "line-through" : ""
                                      }`}
                                    >
                                      {topic.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {formatSecondsToHMS(topic?.videoDuration)}
                                  </span>
                                </div>
                              );
                            })}
                            {chapter.quiz && chapter.quiz.length > 0 && (
                              <div className="flex items-center justify-between p-2 sm:p-3 rounded-md transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300">
                                <div className="flex items-center space-x-2">
                                  <FaList className="text-blue-500 text-sm sm:text-base" />
                                  <span className="text-xs sm:text-sm font-semibold">
                                    Chapter Quiz ({chapter.quiz.length} questions)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Course Description - Made Responsive */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Course Description</h2>
                  <div 
                    className="prose prose-sm sm:prose-base max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description }} 
                  />
                </div>

                {/* Instructor Bio - Made Responsive */}
                <div className="p-3 sm:p-4 lg:p-6">
                  <h1 className="font-bold text-2xl sm:text-3xl mt-2">Instructor</h1>
                  <div className="flex flex-col gap-3 sm:gap-4 mt-4">
                    <p className="text-lg sm:text-xl flex items-center gap-2 text-green-500 font-semibold">
                      <BsFillPersonFill/>
                      {course.teacher.name}
                    </p>
                    <p className="text-lg sm:text-xl">
                      A teacher who loves to teach about{" "}
                      <span className="text-lg sm:text-xl text-green-500 font-bold">
                        {course.courseCategory}
                      </span>
                    </p>
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-7 items-center">
                      <img
                        src={course.teacher.avatar}
                        className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full object-cover"
                        alt={course.teacher.name}
                      />
                      <div className="mt-2 lg:mt-0 w-full lg:w-1/2 break-words whitespace-pre-wrap text-sm sm:text-base">
                        {course.teacher.bio}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Review courseId={id} avgRating={averageRating}/>

                {/* Certificate Section - Made Responsive */}
                <div className="px-4 sm:px-5 lg:px-20 mt-6 sm:mt-7 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-white">
                  <p className="font-mono text-base sm:text-lg lg:text-xl">CERTIFICATE</p>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mt-2">
                    <span className="text-primary-light">Earn and Share</span>{" "}
                    Your Certificate
                  </h1>
                  <div className="flex flex-col lg:flex-row mt-6 sm:mt-9 gap-4 sm:gap-6 lg:gap-11">
                    <div className="flex flex-col gap-4 sm:gap-5 lg:w-1/2">
                      <div className="flex gap-3">
                        <FaShieldAlt className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-primary-light mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <h1 className="font-semibold text-lg sm:text-xl lg:text-2xl">
                            Official & Verifiable
                          </h1>
                          <p className="text-slate-600 text-sm sm:text-base lg:text-base">
                            Receive a signed and verifiable e-certificate from
                            upGrad upon successfully completing the course.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <FaShare className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-primary-light mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <h1 className="font-semibold text-lg sm:text-xl lg:text-2xl">
                            Share Your Achievement
                          </h1>
                          <p className="text-slate-600 text-sm sm:text-base lg:text-base">
                            Post your certificate on LinkedIn or add it to your
                            resume! You can even share it on Instagram or
                            Twitter.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <FaReceipt className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-primary-light mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <h1 className="font-semibold text-lg sm:text-xl lg:text-2xl">
                            Stand Out to Recruiters
                          </h1>
                          <p className="text-slate-600 text-sm sm:text-base lg:text-base">
                            Use your certificate to enhance your professional
                            credibility and stand out among your peers!
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-1/2 flex justify-center lg:justify-end mt-4 lg:mt-0">
                      <img
                        src="https://th.bing.com/th/id/OIP.rxDrB65ZGXpz6L5nE22ecAHaFP?w=249&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7"
                        className="w-full max-w-xs sm:max-w-sm lg:max-w-md rounded-xl"
                        alt="Certificate Preview"
                      />
                    </div>
                  </div>
                </div>

                {/* Similar Courses - Made Responsive */}
                {relatedCourses && (
                  <div className="mt-8 sm:mt-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 leading-snug">
                      <span className="text-primary-light">Learn More with </span>
                      Similar Courses
                    </h1>
                    <div className="mt-8 sm:mt-12 w-full mb-6 flex gap-3 sm:gap-4 overflow-x-auto px-2 scrollbar-hide">
                      {relatedCourses?.map((course, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 border hover:shadow-xl transition duration-300 rounded-xl bg-white overflow-hidden"
                        >
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </>
  );
};

export default CourseIntro;