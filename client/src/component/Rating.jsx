import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from './Toast';
const Rating = ({ courseId, userId }) => {
  const [rating, setRating] = useState(0);

  const handleRating = async (selectedRating) => {
    setRating(selectedRating);
    try {
      await axios.post(`http://localhost:5000/api/rating/${courseId}/rate`, {
        userId,
        rating: selectedRating
      });
      toast.success('Thank you for rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating.');
    }
  };

  return (
    <div className="flex items-center">
      <Toast/>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer text-3xl ${
            star <= rating ? 'text-yellow-500' : 'text-gray-300'
          }`}
          onClick={() => handleRating(star)}
        />
      ))}
    </div>
  );
};

export default Rating;
