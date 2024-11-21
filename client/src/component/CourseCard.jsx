import React from "react";
import API from "../utils/API";
import { useDispatch, useSelector } from "react-redux";
import Button from "./Button";
import { setCurrentCourse } from "../redux/UserSlice";
import { useNavigate } from "react-router-dom";

const CourseCard = ({
  image = "/images/home/thumb.png",
  title,
  description,
  price,
  _id,
}) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const startLearning = async (_id) => {
    try {
      const response = await API.post("/learn/startLearning", {
        _id,
        userId: user.user._id,
      });
      if (response.data.status) {
        dispatch(
          setCurrentCourse({
            course: response.data.updatedUse,
          })
        );
        navigate(`/courseDetail/${_id}`);
      } else {
        alert("error");
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div class="w-full md:max-w-[22rem] p-4 h-full rounded-3xl bg-white border border-gray-300 transition-shadow duration-300 ease-in-out shadow-sm hover:shadow-custom flex flex-col justify-between">
      <div className="w-full flex justify-center items-center">
        <img
          src={image}
          className="w-full h-full max-h-40 object-cover"
          alt=""
        />
      </div>
      <div class="text-gray-900">
        <h3 class="text-xl font-bold py-5">{title}</h3>

        <div className="flex justify-between items-center">
          {price ? <p>₹{price}</p> : <p>Free</p>}
          <Button
            className={
              "p-0 py-1 px-2.5 font-semibold text-center !bg-primary-light"
            }
            title={" Start learning"}
            onClick={() => startLearning(_id)}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
