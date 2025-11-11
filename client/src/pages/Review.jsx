import React, { useEffect, useState } from "react";
import API from "../utils/API";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const Review = ({ courseId , avgRating }) => {
  console.log("avgarting",avgRating)
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get(`/rating/${courseId}/getReview`);
        setReviews(res.data.reviews || []);
        setTotalReviews(res.data.totalReviews || 0);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, [courseId]);

  return (
    <div className=" w-[90%] ml-14 pt-11 pb-2 ">
      <div className="flex gap-2 ml-9">
       <div className="flex gap-2 ">
         <FaStar className="text-yellow-500 text-lg mt-1" />
         <p className=" font-bold text-xl mb-4">{avgRating?.toFixed(1)} Course Rating</p>
       </div>
       <p className="font-bold text-xl flex pl-2 items-center gap-2  mb-4"> <span className=" w-2 h-2 rounded-full bg-slate-400"></span>{totalReviews} Ratings</p>
      </div>
      <Swiper
       modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={3} 
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="pb-6"
      >
        {reviews.map((item, index) => (
          <SwiperSlide
            key={index}
            className="p-4 border-t-2 border-b-2  border-green-300 rounded-xl shadow-sm bg-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={item.userId?.avatar}
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="font-semibold">{item.userId?.name}</div>
            </div>

            <div className="flex mb-2">
              {Array.from({ length: 5 }).map((_, i) =>
                i < item.rating ? (
                  <FaStar key={i} className="text-yellow-500 text-lg" />
                ) : (
                  <FaRegStar key={i} className="text-gray-400 text-lg" />
                )
              )}
            </div>

            <p className="text-black text-sm italic pt-3">
              {item.comment || "No comment provided"}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Review;
