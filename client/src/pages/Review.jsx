import React, { useEffect, useState } from "react";
import API from "../utils/API";
import { FaStar, FaRegStar } from "react-icons/fa";
// Removed: FaChevronLeft, FaChevronRight, Swiper, SwiperSlide, Autoplay, Navigation, "swiper/css", "swiper/css/navigation"

const Review = ({ courseId, avgRating }) => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState({});
  
  const REVIEWS_PER_PAGE = 5;
  // Removed: SWIPER_SLIDES_PER_VIEW as it's no longer needed.

  useEffect(() => {
    // Reset reviews and fetch the first page when courseId changes
    setReviews([]);
    fetchReviews(1);
  }, [courseId]);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/rating/${courseId}/getReview`, {
        params: { page, limit: REVIEWS_PER_PAGE }
      });
      
      const { reviews: newReviews, totalReviews, ratingDistribution } = res.data;
      
      // Append new reviews to the existing list for vertical loading
      setReviews(prev => [...prev, ...newReviews]);
          
      setTotalReviews(totalReviews);
      setRatingDistribution(ratingDistribution || {});
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMoreReviews()) {
      fetchReviews(currentPage + 1);
    }
  };

  const hasMoreReviews = () => {
    return reviews.length < totalReviews;
  };

  // Enhanced rating display component (no changes needed)
  const RatingDisplay = ({ rating, size = "md", showNumber = false }) => {
    const sizes = {
      sm: "text-sm",
      md: "text-lg",
      lg: "text-xl"
    };

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            star <= rating ? (
              <FaStar key={star} className={`text-yellow-500 ${sizes[size]}`} />
            ) : (
              <FaRegStar key={star} className={`text-gray-300 ${sizes[size]}`} />
            )
          ))}
        </div>
        {showNumber && <span className="text-sm text-gray-600 ml-1">({rating})</span>}
      </div>
    );
  };

  // Rating distribution bar (no changes needed)
  const RatingDistribution = () => {
    if (!ratingDistribution || Object.keys(ratingDistribution).length === 0) {
      return null;
    }

    return (
      <div className="mb-6 p-4 bg-white ">
        <h3 className="font-semibold mb-3">Rating Breakdown</h3>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3 mb-2">
              <span className="text-sm w-8">{rating} star</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm w-12 text-gray-600">
                {count} ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className=" pt-11 pb-2">
      {/* Header Section */}
      <div className="flex gap-6 ml-1 mb-6">
        <div className="flex gap-2 items-center">
          <FaStar className="text-yellow-500 text-2xl" />
            <p className="font-bold text-2xl">{avgRating?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-gray-600">Course Rating</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <p className="font-bold text-xl">{totalReviews}</p>
            <p className="text-sm text-gray-600">Ratings</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <RatingDistribution />

      {/* Reviews List (Vertical) */}
      <div className="space-y-6"> {/* Added spacing between reviews */}
        {reviews.length > 0 ? (
          reviews.map((item, index) => (
            <div
              key={`${item._id || item.userId?._id}-${index}`}
              className="p-4 border-t-2 border-b-2 border-green-300 rounded-xl shadow-md bg-white" // Modified styling for a single card
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.userId?.avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-base">
                    {item.userId?.name || "Anonymous"}
                  </div>
                  <RatingDisplay rating={item.rating} size="sm" />
                </div>
              </div>

              {item.createdAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Reviewed on: {new Date(item.createdAt).toLocaleDateString()}
                </p>
              )}

              <p className="text-gray-700 text-sm pt-2">
                {item.comment || "**No comment provided**"}
              </p>
              
            </div>
          ))
        ) : (
          // Optional: Display a message if no reviews are available and not loading
          !loading && <p className="text-center text-gray-500">No reviews yet for this course.</p>
        )}

      </div>

      {/* Pagination/Load More */}
      <div className="flex justify-center mt-8">
        {hasMoreReviews() ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition duration-150"
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>Load More Reviews ({reviews.length} of {totalReviews})</>
            )}
          </button>
        ) : (
          totalReviews > 0 && (
            <p className="text-gray-500 text-sm">
              Showing all {totalReviews} reviews.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Review;
