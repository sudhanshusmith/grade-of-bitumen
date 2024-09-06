import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import Search from '../component/Search';
import * as XLSX from 'xlsx';
import DownloadButton from '../component/DownloadBtn';
import CSVUpload from '../component/CsvUpload';
import MapComponent from '../component/MapComponent';

const accuracyMap = {
  1: 0,
  5: 1,
  10: 2,
  15: 3,
  20: 4,
  25: 5,
  30: 6,
  35: 7,
  40: 8,
  45: 9,
  50: 10,
  55: 11,
  60: 12,
  65: 13,
  70: 14,
  75: 15,
  80: 16,
  85: 17,
  90: 18,
  95: 19,
  99: 20,
};

const stopPoints = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

const categoryOptions = {
  'Normal': 'normal',
  'Extremevalue': 'extreme',
  'Logistic': 'logistic',
  'Tlocationscale': 'scale',
  'Kernel': 'kernel',
  'Generalized': 'generalized',
  'Composite': 'composite'
};

const Dashboard = () => {
  const { latitude, longitude, Location } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('normal');
  const [isAltitudeEnabled, setIsAltitudeEnabled] = useState(false);
  const [accuracy, setAccuracy] = useState(50); 
  const [elevation, setElevation] = useState();
  const [predictedTemp, setPredictedTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [data, setData] = useState([]);
  const [accuracyIndex, setAccuracyIndex] = useState(11);
  const [checkCsv, setCheckCsv] = useState(false);  
  const [selectedTempType, setSelectedTempType] = useState('max'); 

  const handleCategoryChange = (event) => {
    setSelectedCategory(categoryOptions[event.target.value]);
  };

  const handleAltitudeToggle = () => {
    setIsAltitudeEnabled((prev) => !prev);
  };

  const handleAccuracyChange = (event) => {
    const value = Number(event.target.value);
    const closestValue = findClosestStopPoint(value);
    setAccuracy(closestValue);
  
    const accuracyIndex = accuracyMap[closestValue];
    setAccuracyIndex(accuracyIndex);
  };

  const handleElevationChange = (event) => {
    const newElevation = Number(event.target.value);
    setElevation(newElevation);
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
      const predictionData = {
        lat: latitude,
        lon: longitude,
        altitude: isAltitudeEnabled ? 1 : null,
        elevation: isAltitudeEnabled ? elevation : null,
        accuracy: accuracy,
        category: selectedCategoryKey,
        tempType: selectedTempType,  // Send tempType as 'max' or 'min'
      };
      setData(predictionData);

      const response = await fetch('http://localhost:3001/dashboard/find', {
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
          category: selectedCategoryKey,
          tempType: selectedTempType,  // Send tempType as 'max' or 'min'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error from server:', data.error);
        setError(data.error || 'Unknown error'); 
      } else {
        setPredictedTemp(data.temperature); 
        setData([{ ...predictionData, temperature: data.temperature }]);
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
    <div className="bg-[#0F172A] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* <MapComponent/>  */}
      <div className="absolute top-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>
      {error && (
        <div className="mt-4 max-w-xl mx-auto p-4 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}
      
      <div className="p-10 max-w-3xl mx-auto bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl mt-28 mb-10">
        <Search />
        
        {/* Category Dropdown */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-300 font-semibold mb-2">
            Category
          </label>
          <select
            id="category"
            onChange={handleCategoryChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(categoryOptions).map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature Type Dropdown */}
        <div className="mb-4">
          <label htmlFor="tempType" className="block text-gray-300 font-semibold mb-2">
            Temperature Type
          </label>
          <select
            id="tempType"
            value={selectedTempType}
            onChange={(e) => setSelectedTempType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="max">Maximum Temperature</option>
            <option value="min">Minimum Temperature</option>
          </select>
        </div>

        {/* Altitude Toggle */}
        <div className="mb-4 flex items-center">
          <span className="text-gray-300 font-semibold mr-2">Enable Altitude</span>
          <div
            onClick={handleAltitudeToggle}
            role="switch"
            aria-checked={isAltitudeEnabled}
            className={`relative inline-flex items-center cursor-pointer ${isAltitudeEnabled ? 'bg-blue-600 shadow-md' : 'bg-gray-700 shadow-sm'} rounded-full w-16 h-8 transition-colors duration-300 ease-in-out`}
          >
            <span
              className={`absolute left-1 block w-6 h-6 bg-white rounded-full transition-transform transform ${isAltitudeEnabled ? 'translate-x-8' : 'translate-x-1'}`}
            />
          </div>
        </div>

        {/* Elevation Input (if altitude enabled) */}
        {isAltitudeEnabled && (
          <div className="mb-4">
            <label htmlFor="elevation" className="block text-gray-300 font-semibold mb-2">
              Elevation (meters)
            </label>
            <input
              id="elevation"
              type="number"
              value={elevation}
              onChange={handleElevationChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter elevation in meters"
            />
          </div>
        )}

        {/* Accuracy Slider */}
        <div className="mb-4">
          <label htmlFor="accuracy" className="block text-gray-300 font-semibold mb-2">
            Accuracy: {accuracy}%
          </label>
          <input
            type="range"
            id="accuracy"
            value={accuracy}
            min="1"
            max="99"
            step="1"
            onChange={handleAccuracyChange}
            className="w-full"
          />
        </div>

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={isLoading}
          className={`w-full py-2 px-4 font-semibold text-white bg-blue-600 rounded-lg shadow-md transition duration-300 ease-in-out ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Predicting...' : 'Predict'}
        </button>

        {/* Result Display */}
        {predictedTemp !== null && (
          <div className="mt-4 text-center text-2xl font-semibold text-gray-200">
            Predicted Temperature: {predictedTemp}°C
          </div>
        )}

        <DownloadButton data={data} fileName="prediction" />
        <CSVUpload setCheckCsv={setCheckCsv} />
      </div>
    </div>
  );
};

export default Dashboard;
