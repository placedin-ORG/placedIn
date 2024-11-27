import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "../Navbar";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <div className="lg:pl-[235px] grainy-light">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default UserLayout;
