import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/BooksHavenLogo.png";
const Login = () => {
  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-  ">
          <div className="w-20  mx-auto flex shadow-xl rounded-3xl overflow-hidden justify-center">
            <img
            alt="Your Company"
            src={Logo}
            className="mx-auto h-full w-full  "
          />
          </div>
          
          <h1 className="mt-6 text-center text-2xl/9 font-bold ">
            Books Haven
          </h1> 
          <p className="text-center">Library Managment System</p>
        </div>

        <div className="mt-10 p-5 bg-linear-to-r from-amber-500 to-orange-600 rounded-3xl sm:mx-auto  sm:w-full sm:max-w-sm">
          <h2 className="text-2xl font-medium">Welcome Back!</h2>
          <div className="text-xl mt-1">Login to continue to your account</div>
          <form action="#" method="POST" className="space-y-6 mt-5">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
              <div className="flex mt-2 flex-row justify-between">
                <div className="">
                    <input type="checkbox" />
                    Remember me
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-black hover:underline "
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <div>
              <Link to='/dashboard'
                type="submit"
                className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm/6 font-semibold shadow-xs hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </Link>
            </div>
          </form>

          <p className="mt-5 text-center text-sm/6">
            Don't have an account?{" "}
            <Link to="/signup"
              className="font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
