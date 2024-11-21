import React from "react";

const Hero2 = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start p-6">
        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <img
            src="/images/home/learn.png" // Replace with the correct path
            alt="Illustration"
            className="w-3/4 md:w-full"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-8">
          <h1 className="text-2xl md:text-4xl font-bold text-blue-500">
            Your Heading Goes Here
          </h1>
          <p className="mt-4 text-gray-700">
            Add some descriptive text here. This text explains the purpose of
            the illustration and any related details. Make sure it aligns with
            the image on the left.
          </p>
          <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero2;
