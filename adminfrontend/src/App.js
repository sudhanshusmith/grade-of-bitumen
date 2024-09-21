import React from 'react';

const App = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Simple Tailwind App
        </h1>
        <p className="text-gray-600 mb-4 text-center">
          This is a simple app using Tailwind CSS for styling.
        </p>
        <div className="flex justify-center">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
            Click Me
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
