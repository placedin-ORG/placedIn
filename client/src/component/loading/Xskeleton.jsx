import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Xskeletonn=()=>{
    return (
<>
<div className="grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array(3)
            .fill()
            .map((_, idx) => (
              <Skeleton key={idx} height={250} width="100%" containerClassName="w-full h-64 bg-gray-300 rounded-md" />
            ))}
        </div>
</>
    )
}
export default Xskeletonn