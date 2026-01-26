import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = () => {
    return (
        <div 
            // Mimics the CourseCard container's classes
            className="bg-white border border-gray-300 w-full max-w-[22rem] rounded-lg p-4 flex flex-col justify-between"
        >
            {/* 1. Thumbnail */}
            <div className="w-full h-44 object-cover rounded-md mb-4">
                <Skeleton height="100%" /> 
            </div>

            {/* 2. Course Title */}
            <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">
                <Skeleton width="90%" />
            </h3>
            
            {/* 3. Teacher Name/Icon */}
            <h3 className="flex items-center gap-2 text-lg font-sans text-gray-500 font-semibold mb-3">
                {/* Mimics the BsFillPersonFill icon's space */}
                <Skeleton circle width={16} height={16} /> 
                <Skeleton width="50%" height={16} />
            </h3>

            {/* 4. Ratings Area */}
            <div className="flex items-center gap-2 w-full max-w-sm mb-4">
                {/* Rating number (e.g., 4.5) */}
                <Skeleton width={30} height={20} /> 
                
                {/* 5 Stars */}
                <div className="flex justify-start gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} circle width={18} height={18} className="pt-2" />
                    ))}
                </div>
                
                {/* Review count (e.g., (12)) */}
                <Skeleton width={40} height={16} />
            </div>

            {/* 5. Price/Status and Button */}
            <div className="mt-4 flex justify-between items-end gap-3">
                {/* Price/Status Text */}
                <div className="flex gap-1 items-center">
                    <Skeleton width={70} height={24} />
                </div>

                {/* View Button */}
                <Skeleton width={60} height={32} borderRadius={6} />
            </div>
        </div>
    );
};

const Xskeletonn = () => {
    return (
        <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Render 3 instances of the detailed SkeletonCard */}
            {Array(3)
                .fill()
                .map((_, idx) => (
                    <SkeletonCard key={idx} />
                ))}
        </div>
    );
};

export default Xskeletonn;