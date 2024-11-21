import React from "react";

export const Layout = ({ children, className = "", style }) => {
  return (
    <div style={style} className={`${className}`}>
      {children}
    </div>
  );
};
