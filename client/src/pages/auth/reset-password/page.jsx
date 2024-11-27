import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import API from "../../../utils/API";

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from params
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New Password is required.";
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 6 chars, include 1 uppercase, 1 number, and 1 special char.";
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors and try again.");
      return;
    }

    setIsSubmitting(true);
    const passwordResetPromise = API.post(`/auth/reset-password/${token}`, {
      password: formData.newPassword,
      confirmPassword: formData.confirmNewPassword,
    });

    toast.promise(passwordResetPromise, {
      loading: "Reseting Password...",
      success: "Password Reset Successfull",
      error: (err) =>
        err.response?.data?.message ||
        "Failed to reset password. Please try again.",
    });

    try {
      const { data } = await passwordResetPromise;

      navigate("/login");
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen grainy-dark">
      <div className="relative z-10 w-full max-w-lg p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-neumorphic border border-gray-500 border-opacity-30 animate-slide-in-left">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter New Password"
              className={`w-full px-3 py-2.5 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                errors.newPassword ? "focus:ring-red-500" : "focus:ring-primary"
              }`}
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
              className={`w-full px-3 py-2.5 border ${
                errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
              } border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-md focus:outline-none focus:ring-2 ${
                errors.confirmNewPassword
                  ? "focus:ring-red-500"
                  : "focus:ring-primary"
              }`}
              value={formData.confirmNewPassword}
              onChange={handleChange}
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmNewPassword}
              </p>
            )}
          </div>

          <div className="mb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary hover:bg-primary-dark bg-opacity-90 text-white py-2 rounded-md ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
