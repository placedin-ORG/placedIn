import React from "react";

const SmallUnderline = ({ className }) => {
  return (
    <div
      className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-primary rounded-full ${className}`}
    ></div>
  );
};

export default SmallUnderline;
