import React from "react";
import { CiCircleChevRight } from "react-icons/ci";
const Button = ({ title, className, height = 30, width = 30, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${className} text-white text-center relative cursor-pointer font-bold transition-all duration-200 px-5 py-2.5 rounded-full bg-primary border border-transparent flex items-center justify-center gap-2 text-sm  active:scale-95 overflow-hidden button`}
    >
      <span className="text-center">{title}</span>
      <CiCircleChevRight className="text-2xl" />
      {/* <svg
        width={height}
        height={width}
        viewBox="0 0 74 74"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx={34} cy={34} r="32.5" stroke="black" strokeWidth={3} />
        <path
          d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607ZM25 38.5L48 38.5V35.5L25 35.5V38.5Z"
          fill="black"
        />
      </svg> */}
    </button>
  );
};

export default Button;
