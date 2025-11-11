import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../component/Toast";
import API from "../utils/API";
import Navbar from "../component/Navbar";
import { useSelector } from "react-redux";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Register = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormVisible(true);
    }, 500); // Delay matching the form slide-in duration
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (user) {
      navigate("/user/profile");
    }
  }, []);

  // Validation logic
  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z ]{3,}$/; // Name must be at least 3 characters and only letters/spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/; // Password rules

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name =
        "Name must contain only letters and spaces, min 3 chars.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 6 chars, include 1 uppercase, 1 number, and 1 special char.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      toast.error("Please fix the errors and try again.");
      setLoading(false);
      return;
    }

    const registrationPromise = API.post("/auth/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    toast.promise(registrationPromise, {
      loading: "Registering...",
      success: "Registration successful! Redirecting...",
      error: (err) =>
        err.response?.data?.message ||
        "Failed to Register/Signup. Please try again.",
    });

    try {
      const { data } = await registrationPromise;

      navigate("/auth/email-sent");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_APP_BASE_URL}/api/v1/auth/${provider}`;
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center p-3 justify-center min-h-[90vh] grainy-dark">
        <Toast />
        <div className="relative z-10 w-full max-w-lg p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-neumorphic border border-gray-500 border-opacity-30 animate-slide-in-left">
          <h2 className="text-2xl font-bold mb-4 text-center text-primary">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 animate-bounce-in delay-100">
              <label className="block text-gray-700">Name</label>
              <input
                className={`w-full px-3 py-2.5 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.name ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                placeholder="Enter Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4 animate-bounce-in delay-200">
              <label className="block text-gray-700">Email</label>
              <input
                className={`w-full px-3 py-2.5 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                placeholder="user@gmail.com"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="mb-4 animate-bounce-in delay-300">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="********"
                className={`w-full px-3 py-2.5 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.password ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="mb-4 animate-bounce-in delay-400">
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                placeholder="********"
                className={`w-full px-3 py-2.5 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="mb-4 animate-bounce-in delay-500">
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark bg-opacity-90 text-white py-2 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                Sign Up
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

            <div className="pt-2 text-center animate-bounce-in delay-600">
              <span className="text-gray-700">Already Have an Account? </span>
              <button
                className="text-primary hover:underline"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Register;
