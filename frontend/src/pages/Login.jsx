import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/BooksHavenLogo.png";
import { useForm } from "react-hook-form";
import { useUser } from "../context/UserContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import api from "../lib/apiClient";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();

  const { setUser } = useUser();
  const navigate = useNavigate();

  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [loginData, setLoginData] = React.useState(null);

  const onSubmit = async (data) => {
    clearErrors("apiError");

    try {
      const res = await api.post(
        "/auth/login/",
        { username: data.username, password: data.password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data?.ok) {
        setUser(res.data.user);
        setLoginData({ username: data.username });
        setShowConfirmation(true);
        reset();
      } else {
        setError("apiError", {
          type: "manual",
          message: res.data?.message || "Login failed",
        });
      }
    } catch (err) {
      setError("apiError", {
        type: "manual",
        message: err.response?.data?.message || "Invalid username or password",
      });
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/dashboard");
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title="Login Successful! "
        description={`Welcome back, ${loginData?.username}! You have been successfully logged in.`}
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
          <h2 className="text-2xl font-medium">Welcome Back!</h2>
          <div className="text-xl mt-1">Login to continue to your account</div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register("username", {
                    required: "Enter your username",
                    onChange: () => clearErrors("apiError"),
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1" role="alert">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
              </div>

              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Enter your password",
                    onChange: () => clearErrors("apiError"),
                  })}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* API Error */}
              {errors.apiError && (
                <p className="text-red-600 mt-1 text-sm" role="alert" aria-live="polite">
                  {errors.apiError.message}
                </p>
              )}

              <div className="flex mt-2 flex-row justify-between">
                <div className="flex items-center gap-2">
                  <input id="rememberMe" type="checkbox" />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-black hover:underline">
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
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

          <p className="mt-1 text-center text-sm/6">
            Login to Admin Panel ?{" "}
            <Link to="/admin-login" className="font-semibold hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;