import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "../../redux/UserSlice";
import API from "../../utils/API";
import toast from "react-hot-toast";

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Get the user
  const getUser = async () => {
    try {
      const { data } = await API.get("/auth/current-user");
      dispatch(
        setLogin({
          user: data.user,
        })
      );
    } catch (error) {
      toast.error("Please login to access this page!", {
        icon: "🚫",
      });
      dispatch(
        setLogin({
          user: null,
        })
      );
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (user) {
    return children;
  } else {
    return <Navigate to={"/login"} />;
  }
};

export default ProtectedRoutes;
