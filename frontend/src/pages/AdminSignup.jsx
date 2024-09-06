import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [creditleft, setCreditleft] = useState('');
  const [role, setRole] = useState('Level 1');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !secretCode) {
      toast.error('Please fill out all fields.');
      return;
    }

    setLoading(true);

    let backendRole;
    switch (role) {
      case 'Level 1':
        backendRole = 'USER1';
        break;
      case 'Level 2':
        backendRole = 'USER2';
        break;
      case 'ADMIN':
        backendRole = 'ADMIN';
        break;
      default:
        backendRole = 'USER1';
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          secretCode,
          creditleft,
          role: backendRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up user');
      }

      toast.success('User signed up successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error('Error signing up user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Blurry Gradient Circles */}
      {/* <div className="absolute top-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30 z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30 z-0"></div> */}

      {/* Content with Rectangle and Opacity */}
      <div className="bg-gray-800 bg-opacity-70 p-6 max-w-md mx-auto text-white shadow-lg rounded-lg mt-10 z-10">
        <h1 className="text-2xl font-bold mb-4 text-center mb-8">Sign Up New User</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="secretCode" className="block text-gray-300 mb-2">Secret Code</label>
            <input
              type="text"
              id="secretCode"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
              required
            />
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <div className="w-1/2 pr-2">
            <label htmlFor="creditleft" className="block text-gray-300 mb-2">Credit</label>
            <input
              type="number"
              id="creditleft"
              value={creditleft}
              onChange={(e) => setCreditleft(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
            />
          </div>
          <div className="w-1/2 pl-2">
            <label htmlFor="role" className="block text-gray-300 mb-2">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2"
            >
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Give Access'}
        </button>
      </div>
    </div>
  );
};

export default AdminSignup;
