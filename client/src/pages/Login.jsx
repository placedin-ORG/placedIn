import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Toast from "../component/Toast";
import { setLogin } from "../redux/UserSlice";
import API from "../utils/API";
import { tst } from "../utils/utils";
import Navbar from "../component/Navbar";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const { user } = useSelector((state) => state.user);
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // useEffect(() => {
  //   if (user) {
  //     navigate("/user/profile");
  //   }
  // }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_APP_BASE_URL}/api/v1/auth/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    const loginPromise = API.post("/auth/login", { email, password });

    toast.promise(loginPromise, {
      loading: "Logging In...",
      success: "Login successful!",
      error: (err) =>
        err.response?.data?.message ||
        "Failed to Login/SignIn. Please try again.",
    });

    try {
      const response = await loginPromise;

      dispatch(
        setLogin({
          user: response.data.user,
        })
      );
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center p-3 justify-center min-h-[90vh] grainy-dark">
        <Toast />
        <div className="relative z-10 w-full max-w-lg p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-md shadow-neumorphic border border-gray-500 border-opacity-30 animate-slide-in-left">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
            Login
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4 animate-slide-in-right delay-300">
              <label className="block text-gray-700">Email</label>
              <input
                className={`w-full px-3 py-2.5 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md`}
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

            {/* Password Field */}
            <div className="mb-4 animate-slide-in-right delay-400">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                className={`w-full px-3 py-2.5 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md`}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="text-end mb-4">
              {/* <span className="text-gray-700">Forgot your Password? </span> */}
              {/* <span className="text-gray-700">Forgot your Password? </span> */}
              <Link
                to={"/auth/forgot-password"}
                className="text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            {/* Submit Button */}
            <div className="mb-4">
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary bg-opacity-90 text-white py-2 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login
              </button>
            </div>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
            >
              <FaGoogle />
              <span>Continue with Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin("github")}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
            >
              <FaGithub />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Navigation to Register */}
          <div className="pt-2 text-center">
            <span className="text-gray-700">Don't Have an Account? </span>
            <button
              className="text-primary hover:underline"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
