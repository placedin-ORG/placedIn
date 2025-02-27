import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaGraduationCap,
  FaRobot,
  FaBriefcase,
  FaDatabase,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../component/Toast";
import API from "../../utils/API";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Layout/Footer"
const category = [
  { key: "doctorate", icon: FaGraduationCap, label: "Doctorate" },
  { key: "aiml", icon: FaRobot, label: "AIML" },
  { key: "mba", icon: FaBriefcase, label: "MBA" },
  { key: "dataScience", icon: FaDatabase, label: "Data Science" },
  { key: "marketing", icon: FaDatabase, label: "Marketing" },
  { key: "software", icon: FaDatabase, label: "Software & Tech" },
  { key: "management", icon: FaDatabase, label: "Management" },
  { key: "law", icon: FaDatabase, label: "Law" },
];

const Interest = () => {
  const navigate = useNavigate();
  const current = useSelector((state) => state);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    const call = async () => {
      const data = await API.post("/getCategories", {
        userId: current.user.user._id,
      });
      if (data.data.status) {
        setAmenities(data.data.daily || []);
      }
    };
    call();
  }, [current]);

  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities((prevAmenities) =>
        prevAmenities.filter((option) => option !== facility)
      );
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  const submit = async () => {
    if (amenities.length === 0) {
      toast.error("Choose at least one interest");
    } else {
      const data = await API.post("/putCategories", {
        userId: current.user.user._id,
        amenities,
      });
      if (data.data.status) {
        navigate("/user/profile");
      }
    }
  };

  return (
    <>
      <Toast />
      <Navbar/>
      <div className="p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Select Your Interests
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {category?.map((item, index) => (
            <div
              className={`flex flex-col items-center justify-center border-2 rounded-lg p-6 cursor-pointer shadow-md transition-transform duration-300 transform hover:scale-105 ${
                amenities.includes(item.key)
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-gray-100"
              }`}
              key={index}
              onClick={() => handleSelectAmenities(item.key)}
            >
              <item.icon className="text-4xl mb-3" />
              <p className="font-semibold text-lg">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={submit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-md shadow-lg transition-colors duration-300"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Interest;
