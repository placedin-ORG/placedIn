import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "./Toast";
import API from "../utils/API";
const Rating = ({ courseId, userId }) => {
  const [rating, setRating] = useState(0);
  // Replace with actual state logic
  const [hoveredStar, setHoveredStar] = useState(null);

  const handleRating = async (selectedRating) => {
    setRating(selectedRating);
    try {
      await API.post(`/rating/${courseId}/rate`, {
        userId,
        rating: selectedRating,
      });
      toast.success("Thank you for rating!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating.");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Toast />
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer text-4xl transition-all duration-300 ease-in-out transform 
          ${
            star <= (hoveredStar || rating)
              ? "text-yellow-500"
              : "text-gray-300"
          }
          hover:text-yellow-400`} // Color change on hover
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHoveredStar(star)} // Set hovered star
          onMouseLeave={() => setHoveredStar(null)} // Reset hovered star
        />
      ))}
    </div>
  );
};

export default Rating;
