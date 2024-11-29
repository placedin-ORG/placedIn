import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Skeleto = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Title */}
      <Skeleton height={40} width="60%" />

      {/* Photos Section */}
      <div className="grid grid-cols-2 gap-4">
        {Array(4)
          .fill()
          .map((_, index) => (
            <Skeleton key={index} height={256} className="rounded-lg" />
          ))}
      </div>

      {/* Location & Details */}
      <Skeleton width="80%" />
      <Skeleton width="60%" />

      {/* Host Profile */}
      <div className="flex items-center space-x-4">
        <Skeleton circle height={64} width={64} />
        <Skeleton width="50%" height={20} />
      </div>

      {/* Description */}
      <div>
        <Skeleton height={30} width="40%" />
        <Skeleton count={3} />
      </div>

      {/* Amenities */}
      <div>
        <Skeleton height={30} width="40%" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Array(4)
            .fill()
            .map((_, index) => (
              <Skeleton key={index} height={24} />
            ))}
        </div>
      </div>

      {/* Booking Section */}
      <div className="p-6 border rounded-lg shadow">
        <Skeleton height={30} width="50%" />
        <Skeleton height={40} className="mt-4" />
        <Skeleton height={20} width="80%" />
        <Skeleton height={50} className="mt-4" />
      </div>

      {/* Message to Host */}
      <div className="p-4 border-t mt-8">
        <Skeleton height={30} width="40%" />
        <Skeleton height={100} className="mt-2" />
        <Skeleton height={50} className="mt-4" />
      </div>
    </div>
  );
};

export default Skeleto;
