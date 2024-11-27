import { useNavigate } from "react-router-dom";
import API from "../../../utils/API";
import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../component/Button";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const [model, setModel] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "profileImage" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModel(true);
    try {
      const response = await API.post("/create/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setModel(false);
      if (response.data.status) {
        navigate("/auth/email-sent");
      } else {
        toast.error("Some Feild is empty");
      }
    } catch (err) {
      toast.error(err);
      console.log("registration failed", err);
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-10 ">
      <div className="w-full mx-auto max-w-sm p-4 bg-slate-200 border border-slate-300 shadow sm:p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <h5 className="text-xl font-medium text-slate-800">
            Create new Account
          </h5>

          <div className="mb-4 animate-bounce-in delay-100">
            <label className="block text-gray-200">Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
              placeholder="Enter Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 animate-bounce-in delay-200">
            <label className="block text-gray-200">Email</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
              placeholder="Enter Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4 animate-bounce-in delay-300">
            <label className="block text-gray-200">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-3 py-2 border border-gray-300 border-opacity-50 bg-white bg-opacity-30 text-gray-900 rounded-lg"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <Button className="w-full">Create new account</Button>
          <div className="text-center animate-bounce-in delay-600">
            <span className="text-gray-200">Already Have an Account? </span>
            <button className="text-red-400" onClick={() => navigate("/login")}>
              Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
