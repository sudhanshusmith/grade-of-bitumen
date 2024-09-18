import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import Search from "../component/Search";
import CSVUpload from "../component/CsvUpload";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Autocomplete, AutocompleteSessionToken } from '@react-google-maps/api';

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

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

const stopPoints = [
  1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  99,
];

const categoryOptions = {
  Normal: "normal",
  Extremevalue: "extreme",
  Logistic: "logistic",
  Tlocationscale: "scale",
  Kernel: "kernel",
  Generalized: "generalized",
  Composite: "composite",
};

const Dashboard = () => {
  const { latitude, longitude } = useUser();
  const [selectedMode, setSelectedMode] = useState("automatic");
  const [isAltitudeEnabled, setIsAltitudeEnabled] = useState(false);
  const [elevation, setElevation] = useState(null);
  const [accuracy, setAccuracy] = useState(50);
  const [predictedTemp, setPredictedTemp] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("normal");
  const [accuracyIndex, setAccuracyIndex] = useState(11);
 

  const handleCategoryChange = (event) => {
    setSelectedCategory(categoryOptions[event.target.value]);
  };
  const findClosestStopPoint = (value) => {
    return stopPoints.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };
  const handleAccuracyChange = (event) => {
    const value = Number(event.target.value);
    const closestValue = findClosestStopPoint(value);
    setAccuracy(closestValue);
  
    const accuracyIndex = accuracyMap[closestValue];
    setAccuracyIndex(accuracyIndex);
  };
  const handlePredict = async () => {
    if (isAltitudeEnabled && !elevation) {
      alert("Elevation is required when altitude is enabled.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const predictionData = {
        lat: latitude,
        lon: longitude,
        elevation: isAltitudeEnabled ? elevation : null,
      };
      setData(predictionData);

      const response = await fetch("http://localhost:3001/api/user/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
          elevation: isAltitudeEnabled ? elevation : null,
        }),
      });

      const data = await response.json();
      const lat = selectedMode === "automatic" ? latitude : manualLat;
      const lon = selectedMode === "automatic" ? longitude : manualLon;

      console.log("Predicting temperature for", lat, lon);

      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setZoomLevel(10);

      if (!response.ok) {
        console.error("Error from server:", data.error);
        setError(data.error || "Unknown error");
      } else {
        setPredictedTemp(data.temperature);
        setData([{ ...predictionData, temperature: data.temperature }]);
      }
    } catch (error) {
      console.error("Error making prediction:", error);
      setError("Error making prediction: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setManualLat("");
    setManualLon("");
  };

  const handleAltitudeToggle = () => {
    setIsAltitudeEnabled((prev) => !prev);
  };

  const handleElevationChange = (event) => {
    setElevation(event.target.value);
  };

  return (
    <div className=" grid grid-cols-2 bg-[#0F172A] min-h-screen pt-16 ">
      {/* Left Section: Form Inputs */}
      <div className=" bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5 ">
        {/* Mode Toggle Buttons */}
        <div className="grid grid-cols-2 mb-6">
          <button
            onClick={() => handleModeChange("automatic")}
            className={`flex-1 p-2 ${
              selectedMode === "automatic"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-300"
            } border border-blue-600 rounded-l-lg`}
          >
            Automatic
          </button>
          <button
            onClick={() => handleModeChange("manual")}
            className={`flex-1 p-2 ${
              selectedMode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-300"
            } border border-blue-600 rounded-r-lg`}
          >
            Manual
          </button>
        </div>

        {/* Render Search Bar or Latitude/Longitude Fields */}
        {selectedMode === "automatic" ? (
         <div/>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="manualLat"
                className="block text-gray-300 font-semibold mb-2"
              >
                Latitude
              </label>
              <input
                id="manualLat"
                type="number"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Latitude"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="manualLon"
                className="block text-gray-300 font-semibold mb-2"
              >
                Longitude
              </label>
              <input
                id="manualLon"
                type="number"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Longitude"
              />
            </div>
          </>
        )}

        {/* Altitude Toggle */}
        <div className="mb-4 flex items-center">
          <span className="text-gray-300 font-semibold mr-2">
            Enable Altitude
          </span>
          <div
            onClick={handleAltitudeToggle}
            className={`relative inline-flex items-center cursor-pointer ${
              isAltitudeEnabled ? "bg-blue-600" : "bg-gray-700"
            } rounded-full w-16 h-8`}
          >
            <span
              className={`absolute left-1 block w-6 h-6 bg-white rounded-full transform ${
                isAltitudeEnabled ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </div>
        </div>

        {/* Elevation Input */}
        {isAltitudeEnabled && (
          <div className="mb-4">
            <label
              htmlFor="elevation"
              className="block text-gray-300 font-semibold mb-2"
            >
              Elevation (meters)
            </label>
            <input
              id="elevation"
              type="number"
              value={elevation}
              onChange={handleElevationChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
              placeholder="Enter elevation"
            />
          </div>
        )}

        

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          className="w-full py-2 px-4 bg-blue-600 rounded-lg text-white"
        >
          Predict
        </button>

        <CSVUpload setCheckCsv={() => {}} />
        {/* Category Dropdown */}
        {data && data.length > 0 && (
          <div className="mb-4">
          <label
            htmlFor="category"
            className="block text-gray-300 font-semibold mb-2"
          >
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
        )}
        {/* Accuracy Dropdown */}
        { data && data.length > 0 &&  (
          <div className="mb-4">
          <label htmlFor="accuracy" className="block text-gray-300 font-semibold mb-2">
            Accuracy: {accuracy}%
          </label>
          <input
            type="range"
            id="accuracy"
            value={accuracy}
            onChange={handleAccuracyChange}
            className="w-full"
          />
        </div>
        )}

        {/* Loading Indicator */}
        
      </div>

      {/* Right Section: Google Map */}
      <div className=" bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5  border">
        <LoadScript googleMapsApiKey="AIzaSyCdNjPOM_CirNn42mLR18gouaL8-if6Xfo">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={zoomLevel}
          >
            {latitude && longitude && <Marker position={mapCenter} />}
          </GoogleMap>
        </LoadScript> 
      </div>
    </div>
  );
};

export default Dashboard;
