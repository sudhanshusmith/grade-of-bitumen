import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ closeModal }) => { 
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [view, setView] = useState("login");

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    setError("Logging in...");

    try {
      const response = await fetch("http://localhost:3001/api/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`${data.msg || "Login failed"}`);
        return;
      }

      setUser({
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");

      if (closeModal) closeModal(); // Call the correct function to close the modal
    } catch (error) {
      setError("Network error occurred.");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`${data.msg || "Signup failed"}`);
        return;
      }

      setView("login");
    } catch (error) {
      setError("Network error occurred.");
    }
  };

  const renderForm = () => {
    switch (view) {
      case "signup":
        return (
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-100 text-center mb-6">
              Sign Up
            </h2>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-100">Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-100">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-100">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-100">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Sign Up
              </button>
            </div>
            <p className="text-center text-sm text-gray-100">
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="font-medium text-indigo-600 hover:underline"
              >
                Log in here
              </button>
            </p>
          </form>
        );

      default:
        return (
          <form onSubmit={handleSigninSubmit} className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-6">
              Login to Your Account
            </h2>
            {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-100">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-100">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
            </div>
            <p className="text-center text-sm text-gray-100">
              Don't have an account?{" "}
              <button
                onClick={() => setView("signup")}
                className="font-medium text-indigo-600 hover:underline"
              >
                Sign up here
              </button>
            </p>
          </form>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-[#0F172A]">
      {renderForm()}
    </div>
  );
};

export default LoginPage;
