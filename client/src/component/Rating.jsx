import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "./Toast";
import API from "../utils/API";
const Rating = ({ courseId,userId }) => {
  const [rating, setRating] = useState(0);
   const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async () => {
  
    try {
      await API.post(`/rating/${courseId}/rate`,{userId, rating, comment });
      toast.success("Thank you for your review!");
      setComment("");
      setRating(0);
      setIsSubmitted(true);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to submit review.";
      toast.error(msg);
      if (msg.includes("already reviewed")) setIsSubmitted(true);
    }
  };



   return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
      <Toast />

      {/* Rating stars */}
      <div className="flex justify-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-4xl transition-all duration-300 ease-in-out transform ${
              star <= (hoveredStar || rating)
                ? "text-yellow-500"
                : "text-gray-300"
            } hover:text-yellow-400`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
          />
        ))}
      </div>

      {/* Optional comment */}
      <textarea
        placeholder="Write your review (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        rows="3"
      />

      {/* Submit button */}
      <button
        onClick={handleRating}
        disabled={isSubmitting || isSubmitted}
        className="w-full bg-yellow-500 text-white font-semibold py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
      >
        {isSubmitted
          ? "Review Submitted"
          : isSubmitting
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </div>
  );
};

export default Rating;
