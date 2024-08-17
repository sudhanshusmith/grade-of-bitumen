import React, { useState } from 'react';

const stopPoints = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

const categoryOptions = {
  'Normal': 'normal',
  'Extremevalue': 'extreme',
  'Logistic': 'logistic',
  'Tlocationscale': 'scale',
  'Kernel': 'kernel',
  'Composite': 'composite',
};

const CategoryDropdown = ({ latitude, longitude, placeValue }) => {
    // console.log(latitude)
    // console.log(longitude)
    // console.log(placeValue)
  const [selectedCategory, setSelectedCategory] = useState('normal');
  const [isAltitudeEnabled, setIsAltitudeEnabled] = useState(false);
  const [accuracy, setAccuracy] = useState(50); // Set initial value to a default stop point
  const [elevation, setElevation] = useState('');
  const [predictedTemp, setPredictedTemp] = useState(null);

  const handleCategoryChange = (event) => {
    setSelectedCategory(categoryOptions[event.target.value]);
  };

  const handleAltitudeToggle = () => {
    setIsAltitudeEnabled((prev) => !prev);
  };

  const handleAccuracyChange = (event) => {
    const value = Number(event.target.value);
    setAccuracy(value);
  };

  const handleElevationChange = (event) => {
    setElevation(event.target.value);
  };

  const handlePredict = async () => {
    // Validation for elevation if altitude is enabled
    if (isAltitudeEnabled && !elevation) {
      alert('Elevation is required when altitude is enabled.');
      return;
    }
    try {
      const categories = {
        normal: 0,
        extreme: 0,
        logistic: 0,
        scale: 0,
        kernel: 0,
        composite: 0,
      };


      // Set the selected category to 1
      categories[selectedCategory] = 1;
       console.log( longitude, latitude, isAltitudeEnabled,elevation, accuracy, categories)

      const response = await fetch('http://localhost:9001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          altitude: isAltitudeEnabled ? 1 : 0, // Assume 1 for enabled, 0 for disabled
          elevation: isAltitudeEnabled ? elevation : null, // Include elevation if altitude is enabled
          accuracy: accuracy,
          categories: categories, // Sending categories object
        }),
      });

      const data = await response.json();
      setPredictedTemp(data.predicted_temp);
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  // Find the closest stop point
  const findClosestStopPoint = (value) => {
    return stopPoints.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg mt-10 mb-10">
      {/* Dropdown for Category Selection */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">
          Category
        </label>
        <select
          id="category"
          onChange={handleCategoryChange}
          className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(categoryOptions).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Altitude Toggle Button */}
      <div className="mb-4 flex items-center">
        <span className="text-gray-700 font-semibold mr-2">Enable Altitude</span>
        <div
          onClick={handleAltitudeToggle}
          role="switch"
          aria-checked={isAltitudeEnabled}
          className={`relative inline-flex items-center cursor-pointer ${isAltitudeEnabled ? 'bg-blue-600 shadow-md' : 'bg-gray-200 shadow-sm'} rounded-full w-16 h-8 transition-colors duration-300 ease-in-out`}
        >
          <span
            className={`absolute left-1 block w-6 h-6 bg-white rounded-full transition-transform transform ${isAltitudeEnabled ? 'translate-x-8' : 'translate-x-1'}`}
          />
        </div>
      </div>

      {/* Elevation Field (conditionally rendered) */}
      {isAltitudeEnabled && (
        <div className="mb-4">
          <label htmlFor="elevation" className="block text-gray-700 font-semibold mb-2">
            Elevation <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="elevation"
            value={elevation}
            onChange={handleElevationChange}
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter elevation"
            required
          />
        </div>
      )}

      {/* Accuracy Slider */}
      <div className="mb-4 relative">
        <label htmlFor="accuracy" className="block text-gray-700 font-semibold mb-2">
          Accuracy: {accuracy}%
        </label>
        <input
          type="range"
          id="accuracy"
          min="1"
          max="99"
          value={accuracy}
          onChange={(e) => setAccuracy(findClosestStopPoint(Number(e.target.value)))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        {/* Custom Tick Marks */}
        {/* <div className="absolute w-full flex justify-between text-gray-700 text-xs mt-2">
          {stopPoints.map((point, index) => (
            <span key={index}>{point}%</span>
          ))}
        </div> */}
      </div>

      {/* Find Button */}
      <button
        onClick={handlePredict}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
      >
        Find
      </button>

      {/* Display Predicted Temperature */}
      {predictedTemp && (
        <div className="mt-4">
          <p className="text-gray-700 font-semibold">Predicted Temperature: {predictedTemp}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
