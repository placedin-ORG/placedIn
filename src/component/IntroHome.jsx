import React, { useState, useEffect } from 'react';
const IntroHome = () => {
  const images = [
    'https://www.upgrad.com/_ww3-next/image/?url=https%3A%2F%2Fd2o2utebsixu4k.cloudfront.net%2F4th%20persona-a0bdeba4d88b48f182d9108ca4d6b4c0.webp&w=1920&q=75',
    'https://www.upgrad.com/_ww3-next/image/?url=https%3A%2F%2Fd2o2utebsixu4k.cloudfront.net%2FHome_test-e3345391142e4a31a293b6b5be5dfad6.webp&w=1920&q=75',
    'https://www.upgrad.com/_ww3-next/image/?url=https%3A%2F%2Fd2o2utebsixu4k.cloudfront.net%2F1sr%20persona-2514690aa49c4abab9903bd94f7205e2.webp&w=1920&q=75',
    // Add more image URLs here
  ];

  const [currentImage, setCurrentImage] = useState(images[0]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => {
        const currentIndex = images.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 p-4">
    <div className="w-full lg:w-2/4 flex flex-col items-center justify-center border p-4 gap-3">
      <h1 className="text-4xl text-red-600 font-semibold text-center">
        Master tomorrow's skills today.
      </h1>
      <h2 className="text-3xl text-gray-800 font-semibold text-center">
        Excel with India’s top upskilling platform.
      </h2>
      <p className="mt-4 font-semibold text-center">What you can achieve</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <p className="border rounded-md p-2 text-sm text-center">Get a promotion</p>
        <p className="border rounded-md p-2 text-sm text-center">Ace interview skills</p>
        <p className="border rounded-md p-2 text-sm text-center">Move to a new career path</p>
        <p className="border rounded-md p-2 text-sm text-center">Study for Industry Certification</p>
        <p className="border rounded-md p-2 text-sm text-center">Prepare for your first job</p>
        <p className="border rounded-md p-2 text-sm text-center">Get an international degree</p>
      </div>
    </div>

    <div className="w-full h-96 lg:w-2/4 px-14">
      <div className="w-full h-full bg-black rounded-3xl flex flex-col items-center relative overflow-hidden">
        <h1 className="text-red-500 font-bold absolute text-6xl flex justify-center">
          placedIn
        </h1>
        <img
          className="w-3/4 h-3/4 top-12 relative opacity-0 transition-opacity duration-1000 ease-in-out"
          src={currentImage}
          alt="Rotating"
          style={{ opacity: 1 }}
        />
      </div>
    </div>
  </div>
  );
};

export default IntroHome;
