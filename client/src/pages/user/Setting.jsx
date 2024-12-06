import React, { useState } from "react";
import SmallUnderline from "../../component/SmallUnderline";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import API from "../../utils/API";
import { tst } from "../../utils/utils";

const Setting = () => {
  const { user } = useSelector((state) => state.user);
  const [name, setName] = useState(user?.name);
  const [email] = useState(user?.email);
  const [errors, setErrors] = useState({});

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [image, setImage] = useState();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Validate and update name
  const validateAndUpdateName = async () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const updateProfilePromise = API.post("/auth/update-profile", {
        name,
        image,
      });

      toast.promise(updateProfilePromise, {
        loading: "Updating Profile...",
        success: "Profile updated successfully!",
        error: (err) =>
          err.response?.data?.message ||
          "Could not update profile. Please try again.",
      });

      try {
        const { data } = await updateProfilePromise;
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Validate and update password
  const validateAndUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword =
        "New password must be at least 6 characters long.";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      toast.error("Password do not match");
    }

    setPasswordErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const updatePasswordPromise = API.put("/auth/update-password", passwords);

      toast.promise(updatePasswordPromise, {
        loading: "Updating password...",
        success: "Password updated successfully!",
        error: (err) =>
          err.response?.data?.message ||
          "Could not update password. Please try again.",
      });

      try {
        const { data } = await updatePasswordPromise;
        setPasswordModalOpen(false);
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-2 sm:p-6 min-h-[90vh] flex flex-col items-center">
      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 relative">
        Profile Settings
        <SmallUnderline className={"w-8"} />
      </h1>

      {/* Form */}
      <div className="w-full bg-white max-w-lg p-6 rounded-lg border mt-10">
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-28 h-28 mb-6 border border-gray-300 rounded-full">
            <label htmlFor="profileImage" className="cursor-pointer">
              <div className="w-full h-full rounded-full overflow-hidden shadow border relative">
                {image ? (
                  <img
                    src={image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <img
                      src={user?.avatar || "/images/avatar.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553 6.797c.667.995.194 2.203-.853 2.203H5.3c-1.047 0-1.52-1.208-.853-2.203L9 10m3-3.5v4m-3.5-.5h7m-5.5 8h4"
                    />
                  </svg>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                id="profileImage"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 ${
              errors.name ? "focus:ring-red-500" : "focus:ring-primary"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-md"
          />
        </div>
        <button
          onClick={validateAndUpdateName}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none"
        >
          Update
        </button>
        <p>
          Need to update password?{" "}
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="mt-6 hover:underline text-primary focus:outline-none"
          >
            click here
          </button>
        </p>
      </div>

      {/* Update Password */}

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="grainy-light p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Update Password
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border ${
                  passwordErrors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  passwordErrors.currentPassword
                    ? "focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className={`w-full px-4 py-2 border ${
                  passwordErrors.newPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  passwordErrors.newPassword
                    ? "focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border ${
                  passwordErrors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  passwordErrors.confirmPassword
                    ? "focus:ring-red-500"
                    : "focus:ring-primary"
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={validateAndUpdatePassword}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
