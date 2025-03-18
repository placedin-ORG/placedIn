import React from "react";

const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;