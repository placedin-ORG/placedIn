import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { tst } from "../../../utils/utils";
import API from "../../../utils/API";
import SmallUnderline from "../../../component/SmallUnderline";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setPending(true);
    const sendEmailPromise = API.post("/auth/forgot-password", { email });

    toast.promise(sendEmailPromise, {
      loading: "Sending Mail",
      success: "Mail sent, Please Check your mail!",
      error: (err) =>
        err.response?.data?.message ||
        "Could not send Email. Please try again.",
    });

    try {
      const { data } = await sendEmailPromise;

      navigate("/auth/email-sent");
    } catch (error) {
      console.log(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="h-[90vh]  grainy-light p-2 md:p-10 py-10">
      {/* Title */}
      <h1 className="text-center text-2xl md:text-4xl font-bold text-gray-800 mb-6 relative">
        My Courses
        <SmallUnderline className={"w-8"} />
      </h1>
      <div className="flex  justify-between items-center w-full h-full">
        <div className="w-full  mx-auto max-w-lg p-4 border bg-white border-gray-300 rounded-lg  shadow sm:p-6 md:p-8">
          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div className="mb-4 animate-slide-in-right delay-300">
              <label className="block text-gray-700">Email</label>
              <input
                className={`w-full px-3 py-2.5 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                placeholder="Enter Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <button
              className="w-full bg-primary/90 hover:bg-primary text-white py-2 rounded-md"
              pending={pending}
            >
              Send Reset Email
            </button>
            <div className="text-sm text-center font-medium text-slate-800">
              <Link
                to="/login"
                className="text-primary text-center hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
