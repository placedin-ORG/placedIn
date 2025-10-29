import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/UserSlice";
import API from "../../utils/API";
import toast from "react-hot-toast";

const SocialAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      API.get("/auth/current-user")
        .then((res) => {
          dispatch(setLogin({ user: res.data.user }));
          toast.success("Login successful!");
          navigate("/user/profile");
        })
        .catch((err) => {
          toast.error("Failed to fetch user details.");
          navigate("/login");
        });
    } else {
      toast.error("Authentication failed. Please try again.");
      navigate("/login");
    }
  }, [location, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
};

export default SocialAuthCallback;