import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

const CreditsPage = () => {
  const { user } = useUser();
  const [creditLeft, setCreditLeft] = useState(null);
  const [creditUsed, setCreditUsed] = useState(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/prouser/predict", {
          // Adjusted URL to reflect the credits endpoint
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setCreditLeft(data.creditleft);
          setCreditUsed(data.creditused);
        } else {
          console.error("Failed to fetch credits:", data.error);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
      }
    };

    fetchCredits();
  }, []);

  return (
    <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>

      {/* Increased size and darkened the background */}
      <div className="p-16 max-w-3xl mx-auto bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl mt-28 mb-10">
        <h1 className="text-4xl font-bold mb-8 ">Credit Information</h1>
        <div className="space-y-6">
          <div className="flex justify-between border-b border-gray-700 pb-4">
            <div className="font-semibold">Name:</div>
            <div>{user?.name || "N/A"}</div>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-4">
            <div className="font-semibold">Email:</div>
            <div>{user?.email || "N/A"}</div>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-4">
            <div className="font-semibold">Credit Left:</div>
            <div>{creditLeft !== null ? creditLeft : "Loading..."}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-semibold">Credit Used:</div>
            <div>{creditUsed !== null ? creditUsed : "Loading..."}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
