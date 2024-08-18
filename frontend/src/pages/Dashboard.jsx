import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Search from '../component/Search';

const stopPoints = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

const categoryOptions = {
  'Normal': 'normal',
  'Extremevalue': 'extreme',
  'Logistic': 'logistic',
  'Tlocationscale': 'scale',
  'Kernel': 'kernel',
  'Composite': 'composite',
};

const Dashboard = () => {
  const { latitude, longitude, Location } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('normal');
  const [isAltitudeEnabled, setIsAltitudeEnabled] = useState(false);
  const [accuracy, setAccuracy] = useState(50); 
  const [elevation, setElevation] = useState('');
  const [predictedTemp, setPredictedTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [creditLeft, setCreditLeft] = useState(null);
  const [creditUsed, setCreditUsed] = useState(null);
  const [error, setError] = useState(''); 

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('http://localhost:3000/dashboard', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) {
          setCreditLeft(data.creditleft);
          setCreditUsed(data.creditused);
        } else {
          console.error('Failed to fetch credits:', data.error);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, []); 

  const handleCategoryChange = (event) => {
    setSelectedCategory(categoryOptions[event.target.value]);
  };

  const handleAltitudeToggle = () => {
    setIsAltitudeEnabled((prev) => !prev);
  };

  const handleAccuracyChange = (event) => {
    const value = Number(event.target.value);
    setAccuracy(findClosestStopPoint(value));
  };

  const handleElevationChange = (event) => {
    setElevation(event.target.value);
  };

  const handlePredict = async () => {
    if (isAltitudeEnabled && !elevation) {
      alert('Elevation is required when altitude is enabled.');
      return;
    }

    setIsLoading(true); 
    setError(''); 

    try {
      const selectedCategoryKey = selectedCategory;
      console.log({
        lat: latitude,
        lon: longitude,
        altitude: isAltitudeEnabled ? 1 : 0,
        elevation: isAltitudeEnabled ? elevation : null,
        accuracy: accuracy,
        category: selectedCategoryKey
      });

      const response = await fetch('http://localhost:3000/dashboard/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          altitude: isAltitudeEnabled ? 1 : 0,
          elevation: isAltitudeEnabled ? elevation : null,
          accuracy: accuracy,
          category: selectedCategoryKey
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error from server:', data.error);
        setError(data.error || 'Unknown error'); 
      } else {
        setPredictedTemp(data.temperature); 
      }
    } catch (error) {
      console.error('Error making prediction:', error);
      setError('Error making prediction: ' + error.message); 
    } finally {
      setIsLoading(false); 
    }
  };

  const findClosestStopPoint = (value) => {
    return stopPoints.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  return (
    <div>
      {error && (
        <div className="mt-4 max-w-xl mx-auto p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}
      <Search />
      <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg mt-10 mb-10">
        <div className="mb-4">
          <div className="flex justify-between">
            <div className="font-semibold text-gray-700">Credit Left:</div>
            <div className="text-gray-600">{creditLeft !== null ? creditLeft : 'Loading...'}</div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="font-semibold text-gray-700">Credit Used:</div>
            <div className="text-gray-600">{creditUsed !== null ? creditUsed : 'Loading...'}</div>
          </div>
        </div>

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
            onChange={handleAccuracyChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="Location" className="block text-gray-700 font-semibold mb-2">
            Location
          </label>
          <input
            type="text"
            id="Location"
            value={Location || 'N/A'}
            readOnly
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="latitude" className="block text-gray-700 font-semibold mb-2">
            Latitude
          </label>
          <input
            type="text"
            id="latitude"
            value={latitude || 'N/A'}
            readOnly
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="longitude" className="block text-gray-700 font-semibold mb-2">
            Longitude
          </label>
          <input
            type="text"
            id="longitude"
            value={longitude || 'N/A'}
            readOnly
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
          />
        </div>

        {latitude && longitude && Location && (
          <button
            onClick={handlePredict}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            disabled={isLoading} 
          >
            {isLoading ? 'Loading...' : 'Find'}
          </button>
        )}

        {predictedTemp && (
          <div className="mt-4">
            <p className="text-gray-700 font-semibold">Predicted Temperature:</p>
            <p className="text-lg font-bold text-blue-500">{predictedTemp}°C</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
