import React, { useState, useEffect } from "react";
import Navbar from "../../component//Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaClock,
  FaList,
  FaPhone,
  FaReceipt,
  FaShare,
  FaShieldAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { FaStar, FaRegStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "../../component/Layout/Footer";
import SkeletonLoading from "../../component/loading/SkeletonLoading";
import API from "../../utils/API";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../component/Toast";
import ExamCard from "../../component/exams/ExamCard";
import { useRazorpay } from "react-razorpay";
import { tst } from "../../utils/utils";
import parse from "html-react-parser";

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

const ExamIntro = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [relatedExam, setRelatedExam] = useState(null);
  const [start, setStart] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [examGiven, setExamGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissionDate, setSubmissionDate] = useState(null);
  const user = useSelector((state) => state);
  const { Razorpay } = useRazorpay();

  const getExamStatus = async () => {
    try {
      const { data } = await API.get(`/exam/given/${id}`);
      setExamGiven(data.examCompleted);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getExamStatus();
  }, []);

  useEffect(() => {
    const call = async () => {
      if (user.user.user !== null) {
        const data = await API.post("/exam/fetchExam", {
          id,
          userId: user.user.user._id,
        });

        if (data.data.status) {
          setLoading(false);
          setExam(data.data.exam);

          if (data.data.examResult) {
            setExamGiven(true);
            setSubmissionDate(data.data.examResult.createdAt);
          }

          if (
            data?.data?.exam?.enrolledStudents?.some(
              (student) => student.userId === user.user.user._id
            )
          ) {
            setEnrolled(true);
          }
        }
      } else {
        const data = await API.post("/exam/fetchExam", {
          id,
          userId: null,
        });

        if (data.data.status) {
          setLoading(false);
          setExam(data.data.exam);

          if (data.data.relatedExams.length !== 0) {
            setRelatedExam(data.data.relatedExams);
          }
        }
      }
    };
    call();
  }, []);

  const startLearning = async () => {
    if (user.user.user === null) {
      navigate("/register");
      return;
    }

    if (exam.publishResult && examGiven) {
      navigate(`/exam/result/${id}`);
      return;
    }

    if (start || enrolled) {
      navigate(`/exam/${user.user.user._id}/${id}`);
    } else {
      if (exam.price > 0) {
        await handlePayment();
      } else {
        navigate(`/examInstruction/${user.user.user._id}/${id}`);
      }
    }
  };

  const handlePayment = async () => {
    const options = {
      key: import.meta.env.VITE_APP_RAZOR_API_KEY,
      amount: Math.ceil(exam.price - exam.discountAmount) * 100,
      currency: "INR",
      name: "PlacedIn",
      description: "Test Transaction",
      image:
        "https://s3.ap-south-1.amazonaws.com/assets.ynos.in/startup-logos/YNOS382149.jpg",

      handler: async (res) => {
        const payload = {
          exam: exam._id,
          user: user.user.user._id,
          purchaseFor: "Exam",
          paymentId: res.razorpay_payment_id,
          amount: exam.price - exam.discountAmount,
          success: true,
        };

        await API.post("/purchase/create", payload);
        await API.put(`/exam/enroll-user/${exam._id}`);
        setEnrolled(true);
        toast.success("Payment successful");
      },

      prefill: {
        name: user?.user?.name,
        email: user?.user?.email,
      },

      theme: { color: "#3399cc" },
    };

    const rzpay = new Razorpay(options);

    rzpay.on("payment.failed", async (response) => {
      const payload = {
        exam: exam._id,
        user: user.user.user._id,
        purchaseFor: "Exam",
        paymentId: response.error.metadata.payment_id,
        amount: exam.price - exam.discountAmount,
        success: false,
      };

      await API.post("/purchase/create", payload);
      toast.error("Payment failed");
    });

    rzpay.open();
  };

  const [showMore, setShowMore] = useState(false);
  const maxDescriptionLength = 100;

  let truncatedDescription = "";
  let optimizedImage = "";

  if (exam !== null) {
    truncatedDescription =
      exam.description.length > maxDescriptionLength && !showMore
        ? `${exam.description.substring(0, maxDescriptionLength)}...`
        : exam.description;

    optimizedImage =
      exam.examThumbnail &&
      `${exam.examThumbnail}?w_800,h_600,c_fill,q_auto,f_auto`;
  }

  return (
    <>
      <Navbar />

      {loading ? (
        <SkeletonLoading />
      ) : (
        <div className="bg-slate-50">
          <Toast />

          {exam && (
            <div>
              {/* ---------------------- HERO SECTION ---------------------- */}
              <div className="px-14 w-full flex flex-col lg:flex-row gap-10 mt-4">
                {/* Image */}
                <div className="lg:w-1/2 w-full">
                  <div className="h-auto w-full overflow-hidden rounded-xl shadow-lg">
                    <img
                      src={optimizedImage || exam.examThumbnail}
                      className="w-full h-full object-cover"
                      alt={exam.examTitle}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="lg:w-1/2 w-full flex items-center justify-start py-5">
                  <div className="px-5 lg:px-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <p className="px-5 py-1 bg-green-100 text-green-500 rounded-2xl font-semibold">
                        {exam.price > 0 ? (
                          <span>₹{exam.price - exam.discountAmount}</span>
                        ) : (
                          "Free"
                        )}
                      </p>

                      {exam.discountAmount > 0 && (
                        <span className="text-gray-600 line-through">
                          ₹{exam.price}
                        </span>
                      )}
                    </div>

                    <h1 className="text-red-500 font-semibold text-3xl lg:text-5xl">
                      {exam.examTitle}
                    </h1>

                    <div className="flex flex-col gap-2 mt-3">
                      <span className="text-red-500 text-lg flex items-center gap-2">
                        <FaCalendarAlt />
                        <span className="text-slate-600 font-semibold">
                          {new Date(exam.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </span>

                      <span className="text-red-500 text-lg flex items-center gap-2">
                        <FaClock />
                        <span className="text-slate-600 font-semibold">
                          {exam.duration >= 60
                            ? `${Math.floor(exam.duration / 60)} hours`
                            : `${exam.duration} minutes`}
                        </span>
                      </span>
                    </div>

                    {/* Button */}
                    <div className="flex flex-col">
                      <button
                        className="text-lg text-white bg-primary-light px-14 rounded-xl py-2 font-semibold mt-4 disabled:opacity-60"
                        onClick={() => startLearning()}
                        disabled={
                          (!exam.publishResult && examGiven) ||
                          (exam.publishResult && !examGiven)
                        }
                      >
                        {exam.publishResult
                          ? "View Results"
                          : examGiven
                          ? "Please Wait for Results"
                          : enrolled
                          ? "Start Test Now"
                          : "Register for Exam"}
                      </button>

                      {examGiven && !exam.publishResult && submissionDate && (
                        <p className="text-sm text-gray-600 mt-2">
                          Predicted result date:{" "}
                          <span className="font-semibold">
                            {new Date(
                              new Date(submissionDate).setDate(
                                new Date(submissionDate).getDate() + 5
                              )
                            ).toLocaleDateString("en-GB")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------------------- WHAT YOU NEED ---------------------- */}
              <div className="px-14 mt-8">
                <p className="text-3xl font-bold">
                  What You will <span className="text-primary-light">Need</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                  {exam.topics.map((elem, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-300 flex p-3 rounded-xl hover:border-primary-dark hover:text-red-500 items-center justify-center font-semibold"
                    >
                      {elem}
                    </div>
                  ))}
                </div>

                {/* ---------------------- DESCRIPTION ---------------------- */}
                <div className="mt-6">
                  <p className="text-3xl font-bold">Description</p>

                  <p className="text-lg font-semibold text-slate-600 mt-4">
                    {parse(truncatedDescription)}

                    {exam.description.length > maxDescriptionLength && (
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="text-red-500 font-bold ml-2"
                      >
                        {showMore ? "See Less" : "See More"}
                      </button>
                    )}
                  </p>
                </div>

                {/* ---------------------- CERTIFICATE SECTION ---------------------- */}
                <div className="mt-10 py-5 rounded-3xl flex flex-col lg:flex-row gap-10 items-start">
                  {/* Left: Text */}
                  <div className="flex flex-col gap-2 lg:w-1/2">
                    <p className="font-mono text-lg">CERTIFICATE</p>

                    <h1 className="text-3xl font-semibold">
                      <span className="text-primary-light">Earn and Share</span>{" "}
                      Your Certificate
                    </h1>

                    {/* Official */}
                    <div className="flex gap-3 mt-5">
                      <FaShieldAlt className="text-4xl text-primary-light" />
                      <div>
                        <h1 className="font-semibold text-2xl">
                          Official & Verifiable
                        </h1>
                        <p className="text-slate-600">
                          Get a verifiable certificate after completion.
                        </p>
                      </div>
                    </div>

                    {/* Share */}
                    <div className="flex gap-3 mt-5">
                      <FaShare className="text-4xl text-primary-light" />
                      <div>
                        <h1 className="font-semibold text-2xl">
                          Share Your Achievement
                        </h1>
                        <p className="text-slate-600">
                          Share on LinkedIn, resume, Instagram & more.
                        </p>
                      </div>
                    </div>

                    {/* Recruiters */}
                    <div className="flex gap-3 mt-5">
                      <FaReceipt className="text-4xl text-primary-light" />
                      <div>
                        <h1 className="font-semibold text-2xl">
                          Stand Out to Recruiters
                        </h1>
                        <p className="text-slate-600">
                          Improve your credibility with recruiters.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Certificate Image */}
                  <div className="lg:w-1/2 w-full">
                    <img
                      src="https://th.bing.com/th/id/OIP.rxDrB65ZGXpz6L5nE22ecAHaFP?w=249&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7"
                      className="w-full rounded-xl shadow"
                      alt="Certificate Preview"
                    />
                  </div>
                </div>

                {/* ---------------------- RELATED COURSES ---------------------- */}
                {relatedExam && (
                  <div className="mt-10">
                    <p className="text-sm font-mono text-gray-500 uppercase tracking-wide">
                      Related Courses
                    </p>

                    <h1 className="text-4xl font-bold text-gray-800">
                      <span className="text-primary-light">Learn More</span>{" "}
                      with Similar Courses
                    </h1>

                    <div className="mt-10 flex gap-6 overflow-x-scroll px-4">
                      {relatedExam.map((exam, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 hover:shadow-xl transition duration-300 rounded-xl bg-white overflow-hidden"
                        >
                          <ExamCard exam={exam} />
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

export default ExamIntro;
