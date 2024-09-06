import React from "react";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const userData = localStorage.getItem("user");

    if (userData) {
      // User is logged in, redirect to the dashboard
      navigate("/dashboard");
    } else {
      // User is not logged in, show toast error
      toast.error("Please log in first to access the dashboard", {
        position: "top-right", // Use string for position
        autoClose: 3000, // 3 seconds
      });
    }
  };

  return (
    <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Blurry Gradient Circles */}
      <div className="absolute top-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-28 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          Welcome to Temperature Predictions
        </h1>
        <p className="text-lg md:text-2xl text-[#94A3B8] mt-6 max-w-2xl leading-relaxed">
          Climate Data Online (CDO) provides free access to NCDC's archive of global historical weather and climate data.
          These data include quality-controlled daily, monthly, seasonal, and yearly measurements of temperature,
          precipitation, wind, and more.
        </p>

        {/* Call to Action Button */}
        <div className="mt-10">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
