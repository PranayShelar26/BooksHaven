import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/BooksHavenLogo.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import ConfirmationDialog from "../components/ConfirmationDialog";

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm();

  const password = watch("password");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signupData, setSignupData] = useState(null);

  const onSubmit = async (data) => {
    if (confirmPassword !== data.password) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        data
      );

      if (res.data.ok) {
        setSignupData({
          username: data.username,
          email: data.email,
        });
        setShowConfirmation(true);
        reset();
        setConfirmPassword("");
      }
    } catch (err) {
      setError("apiError", {
        type: "manual",
        message: err.response?.data?.message || "Signup failed. Please try again.",
      });
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/login");
  };

  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value === password) {
      clearErrors("confirmPassword");
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title="Account Created Successfully! ✓"
        description={`Welcome, ${signupData?.username}! Your account has been created. Email: ${signupData?.email}. You can now log in to your account.`}
        confirmText="Go to Login"
        isDangerous={false}
      />

      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="w-20  mx-auto flex shadow-xl rounded-3xl overflow-hidden justify-center">
            <img
              alt="Your Company"
              src={Logo}
              className="mx-auto h-full w-full  "
            />
          </div>
          <h1 className="mt-6 text-center text-2xl/9 font-bold ">Books Haven</h1>
          <p className="text-center">Library Managment System</p>
        </div>

        <div className="mt-6 p-5 shadow-sm shadow-amber-600 bg-linear-to-r from-amber-500 to-orange-600 rounded-3xl sm:mx-auto  sm:w-full sm:max-w-sm">
          <h2 className="text-2xl font-medium">Create Account!</h2>
          <div className="text-l mt-1">Register to start borrowing books</div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            method="POST"
            className="space-y-2 mt-5"
          >
            {/* API Error */}
            {errors.apiError && (
              <p className="text-red-600 text-sm mt-1">
                {errors.apiError.message}
              </p>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600    sm:text-sm/6 ${
                    errors.username
                      ? "outline-red-600 focus:outline-red-600"
                      : "outline-gray-300 focus:outline-indigo-600"
                  }`}
                  {...register("username", {
                    required: true,
                    pattern: {
                      value:
                        /^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
                      message: "Username format invalid",
                    },
                    minLength: {
                      value: 3,
                      message: "The username should be minimum 3 characters.",
                    },
                  })}
                />
                {errors.username && (
                  <p className="text-white text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                    errors.email
                      ? "outline-red-600 focus:outline-red-600"
                      : "outline-gray-300 focus:outline-indigo-600"
                  }`}
                  {...register("email", {
                    required: true,
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-white text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

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
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                    errors.password
                      ? "outline-red-600 focus:outline-red-600"
                      : "outline-gray-300 focus:outline-indigo-600"
                  }`}
                  {...register("password", {
                    required: true,
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                      message:
                        "Password should contain atleast 1 special character, number, Upper and lower character",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-white text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="Confirmpassword"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="Confirmpassword"
                  name="Confirmpassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                    errors.confirmPassword
                      ? "outline-red-600 focus:outline-red-600"
                      : ""
                  }`}
                  value={confirmPassword}
                  onChange={handleConfirmChange}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full mt-5 justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold shadow-xs hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 "
              >
                Sign up
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm/6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline ">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;