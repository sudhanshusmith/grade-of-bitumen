import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import LoginPage from "../pages/Login";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, setUser } = useUser(); // Access user context
  const navigate = useNavigate(); // Handle navigation

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/logout", {
        method: "GET",
        credentials: 'include' // Include credentials to handle cookies
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear user state
      setUser(null);
      localStorage.removeItem("placeData");

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error); 
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center">
            {user ? (
              <div className="flex flex-col items-start text-gray-800">
                <div className="font-medium">Hi {user.name}</div>
                <div className="text-gray-600 text-sm">{user.email}</div>
              </div>
            ) : (
              <div className="text-gray-800 font-medium">Company Name</div>
            )}
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-800 font-medium hover:text-indigo-500"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-800 font-medium hover:text-indigo-500"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-800 font-medium hover:text-indigo-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={openModal}
                className="text-gray-800 font-medium hover:text-indigo-500"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LoginPage closeModal={closeModal} />
      </Modal>
    </nav>
  );
};

export default Navbar;
