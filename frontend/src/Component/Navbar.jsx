import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import LoginPage from "./Enter";
import { useUser } from "../context/UserContext";
import AdminSignup from "../pages/AdminSignup";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/prouser/logout", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      localStorage.removeItem("placeData");
      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDashboardClick = (event) => {
    if (!user) {
      event.preventDefault();
      openModal();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <nav
      className={`${
        isScrolled ? "bg-purple-900 bg-opacity-10 backdrop-blur-md shadow-md" : "bg-transparent "
      } fixed w-full top-0 z-50 transition-colors duration-300 ease-in-out`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center">
            {user ? (
              <div className="flex flex-col items-start text-white">
                <div className="font-medium">Hi {user.fullName}</div>
                <div className="text-gray-300 text-sm">{user.email}</div>
              </div>
            ) : (
              <div className="text-white font-medium">BitumenTemp Wizard</div>
            )}
          </div>

          <div className="flex items-center space-x-10">
            <Link
              to="/"
              className="text-white font-medium hover:text-purple-300"
            >
              Home
            </Link>
            <Link
              to="/teamsection"
              className="text-white font-medium hover:text-purple-300"
            >
              Team
            </Link>
            {user && (
              <Link
                to="/credits"
                className="text-white font-medium hover:text-purple-300"
              >
                Credits
              </Link>
            )}
            <a
              href="/dashboard"
              onClick={handleDashboardClick}
              className={`text-white font-medium hover:text-purple-300 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Dashboard
            </a>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin-signup"
                className="text-white font-medium hover:text-purple-300"
              >
                Signup User
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="text-white font-medium hover:text-purple-300"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={openModal}
                className="text-white font-medium hover:text-purple-300"
              >
                Enter
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LoginPage closeModal={closeModal} />
      </Modal>
    </nav>
  );
};

export default Navbar;
