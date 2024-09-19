import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Search from "../component/Search";
import PredictedTemperatureTable from "../component/PredictedTemperatureTable";

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
  const { latitude, longitude, predictedTemp, setPredictedTemp , } = useUser();
  const [selectedMode, setSelectedMode] = useState("automatic");
  const [isAltitudeEnabled, setIsAltitudeEnabled] = useState(false);
  const [elevation, setElevation] = useState(null);
  const [accuracy, setAccuracy] = useState(50);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [zoomLevel, setZoomLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("normal");
  const [accuracyIndex, setAccuracyIndex] = useState(11);
  const [isDisabled, setIsDisabled] = useState(false);
  const [storedPredictedTemp, setStoredPredictedTemp] = useState({});

  useEffect(() => {
    setStoredPredictedTemp(localStorage.getItem('predictedTemp'));
  }, [predictedTemp]); 


  const handleCategoryChange = (event) => {
    setSelectedCategory(categoryOptions[event.target.value]);
  };
  useEffect(() => {
    localStorage.removeItem('placeData');
    localStorage.removeItem('predictedTemp');
  }, []); 

  // const findClosestStopPoint = (value) => {
  //   return stopPoints.reduce((prev, curr) =>
  //     Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  //   );
  // };

  // const handleAccuracyChange = (event) => {
  //   const value = Number(event.target.value);
  //   const closestValue = findClosestStopPoint(value);
  //   setAccuracy(closestValue);

  //   const accuracyIndex = accuracyMap[closestValue];
  //   setAccuracyIndex(accuracyIndex);
  // };

  const handlePredict = async () => {
    setIsLoading(true);
    setIsDisabled(true);
    if (isAltitudeEnabled && !elevation) {
      alert("Elevation is required when altitude is enabled.");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }
    if (latitude === null || longitude === null) {
      alert("Lontitude and Latitude is required. ");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    setIsLoading(true);
    setError("");
    // localStorage.setItem("placeData", JSON.stringify({ latitude, longitude }));

    try {
      const predictionData = {
        lat: latitude,
        lon: longitude,
        elevation: isAltitudeEnabled ? elevation : null,
      };
      setData(predictionData);

      const response = await fetch(
        "http://localhost:3001/api/prouser/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            lat: latitude,
            lon: longitude,
            altitude: elevation,
          }),
        }
      );

      const data = await response.json();
      const lat = selectedMode === "automatic" ? latitude : manualLat;
      const lon = selectedMode === "automatic" ? longitude : manualLon;

      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setZoomLevel(10);

      if (!response.ok) {
        console.error("Error from server:", data.error);
        setError(data.error || "Unknown error");
      } else {
        setPredictedTemp(data);
        localStorage.setItem("predictedTemp", JSON.stringify(data));
        setData([{ ...predictionData, temperature: data.temperature }]);
      }
      setIsLoading(false);
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
  const resetChange = () => {
    setPredictedTemp({});
    setManualLat("");
    setManualLon("");
    setElevation(null);
    setAccuracy(50);
    setIsAltitudeEnabled(false);
    setIsLoading(false);
    setError("");
    setIsDisabled(false);
    localStorage.removeItem("placeData");
    localStorage.removeItem("predictedTemp");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-[#0F172A] min-h-screen pt-16">
      {/* Left Section: Form Inputs */}
      <div className="bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5">
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
          <Search />
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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Elevation"
            />
          </div>
        )}

        {/* Accuracy Slider
        {predictedTemp && Object.keys(predictedTemp).length > 0 && (
          <div className="mb-4">
            <label
              htmlFor="accuracy"
              className="block text-gray-300 font-semibold mb-2"
            >
              Accuracy
            </label>
            <input
              id="accuracy"
              type="range"
              min="50"
              max="99"
              value={accuracy}
              onChange={handleAccuracyChange}
              className="w-full"
            />
            <div className="text-gray-300 mt-2">{accuracy}</div>
          </div>
        )} */}

        {/* Category Dropdown */}
        {storedPredictedTemp && Object.keys(storedPredictedTemp).length && (
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-gray-300 font-semibold mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="extreme">Extreme</option>
              <option value="logistic">Logistic</option>
              <option value="scale">TLocationScale</option>
              <option value="kernel">Kernel</option>
              <option value="generalized">Generalized</option>
              <option value="composite">Composite</option>
            </select>
          </div>
        )}

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          className={`w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
            isLoading || isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isDisabled}
        >
          {isLoading ? "Predicting..." : "Predict"}
        </button>

        <div className="flex justify-end w-full">
          <button
            onClick={resetChange}
            className="text-white mt-4 hover:bg-slate-600 bg-slate-500 font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-2 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* {predictedTemp && predictedTemp.length > 1 && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold text-white">
            Predicted Temperature:
          </h3>
          <p className="text-gray-300 text-lg">{predictedTemp}°C</p>
        </div>
      )} */}

      {/* Right Section: Google Map */}
      <div className=" bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5  border">
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={zoomLevel}
          >
            <Marker position={mapCenter} />
          </GoogleMap>
        </LoadScript>
        {storedPredictedTemp && Object.keys(storedPredictedTemp).length > 0 && (
        <PredictedTemperatureTable
          selectedCategory={selectedCategory}
          predictedTemp={storedPredictedTemp}
          accuracyMap={accuracyMap}
        />
      )}
      </div>
    </div>
  );
};

export default Dashboard;
