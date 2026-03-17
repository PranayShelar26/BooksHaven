import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/BooksHavenLogo.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useUser } from "../context/UserContext";
import ConfirmationDialog from "../components/ConfirmationDialog";

const AdminLogin = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm();
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [loginData, setLoginData] = React.useState(null);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login/",
        {
          username: data.username,
          password: data.password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.ok) {
        if (!res.data.user.is_admin) {
          // logged in successfully but not an admin
          await axios.post("http://localhost:8000/api/auth/logout/");
          setError("apiError", {
            type: "manual",
            message: "Admin access only.",
          });
          return;
        }
        setUser(res.data.user);
        setLoginData({ username: data.username });
        setShowConfirmation(true);
        reset();
      }
    } catch (err) {
      setError("apiError", {
        type: "manual",
        message: err.response?.data?.message || "Invalid credentials.",
      });
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/admin-dashboard");
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title="Admin Login Successful! ✓"
        description={`Welcome Admin, ${loginData?.username}! You have been successfully logged in to the admin panel.`}
        confirmText="Continue"
        isDangerous={false}
      />

      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        {/* Logo Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="w-20 mx-auto flex shadow-xl rounded-3xl overflow-hidden justify-center">
            <img alt="Books Haven" src={Logo} className="mx-auto h-full w-full" />
          </div>
          <h1 className="mt-6 text-center text-2xl/9 font-bold">Books Haven</h1>
          <p className="text-center">Library Management System</p>
        </div>

        {/* Login Form */}
        <div className="mt-10 p-5 bg-linear-to-r from-amber-500 to-orange-600 rounded-3xl sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-2xl font-medium">Admin Login</h2>
          <div className="text-xl mt-1">Login to continue to your account</div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  type="text"
                  {...register("username", {
                    required: "Enter your username",
                    onChange: () => clearErrors("apiError"),
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Enter your password",
                    onChange: () => clearErrors("apiError"),
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* API Error */}
              {errors.apiError && (
                <p className="text-red-600 mt-1 text-sm">
                  {errors.apiError.message}
                </p>
              )}

              <div className="flex mt-2 flex-row justify-between">
                <div>
                  <input type="checkbox" /> Remember me
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-black hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold shadow-xs hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </button>
            </div>
          </form>

          {/* Signup Link */}
          <p className="mt-5 text-center text-sm/6">
            Not an admin?{" "}
            <Link to="/login" className="font-semibold hover:underline">
              Login as user
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;