"use client";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authprovider";
import api from "@/lib/api";
import { tst } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useCartContext } from "@/context/cartprovider";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [pending, setPending] = useState(false);
  const { login } = useAuthContext();
  const router = useRouter();
  const { emptyCart } = useCartContext();
  const { cart } = useCartContext();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      setPending(true);
      const response = await api.post("/auth/login", formData);
      const user = response.data.user;
      const vendor = response.data.vendor;
      const authHeader = response.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        localStorage.setItem("token", token);
      }
      login();
      if (cart.length > 0) await api.post("/cart/save", { cartItems: cart });
      emptyCart();
      if ((user.role === "vendor" && vendor) || user.role === "admin")
        router.push("/vendor");
      else if (user.role === "vendor") router.push("/vendor-register");
      else router.push("/");
      tst.success("Signin success");
    } catch (error) {
      tst.error(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex justify-between items-center  w-full ">
      <div className="w-full  mx-auto max-w-sm p-4 bg-slate-200 border border-slate-400  shadow sm:p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSignin}>
          <h5 className="text-xl font-medium text-slate-800">
            Sign in to our platform
          </h5>
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-slate-800"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="bg-slate-300 border border-slate-300 text-slate-700 text-sm  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-slate-400"
              placeholder="Enter your email"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-slate-800"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className="bg-slate-300 border border-slate-300 text-slate-700 text-sm  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-slate-400"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-start">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-700 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Button className="w-full" pending={pending}>
            Login to your Account
          </Button>
          <div className="text-sm font-medium text-slate-800">
            Not registered?{" "}
            <Link
              href="/auth/register"
              className="text-blue-700 hover:underline"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
