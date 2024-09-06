import React, { useState } from "react";
import { useUser } from "../context/UserContext";

const LoginPage = ({ closeModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("Login....");

    try {
      const response = await fetch("http://localhost:3001/users/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
    
      if (!response.ok) {
        throw new Error("Incorrect Email or Password");
      }
    
      const data = await response.json();
    
      // Create user object
      const user = {
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role
      };
    
      // Update state with user data
      setUser(user);
    
      localStorage.setItem('user', JSON.stringify(user));
    
      closeModal(); 
    } catch (error) {
      setError(error.message);
    }
    
  };

  return (
    <div className="p-6 lg:p-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 text-center mb-6">
        Login to Your Account
      </h2>
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="********"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            /> */}
            {/* <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label> */}
          </div>
          <div className="text-sm">
            {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a> */}
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </div>
      </form>
      {/* <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </a>
      </p> */}
    </div>
  );
};

export default LoginPage;
