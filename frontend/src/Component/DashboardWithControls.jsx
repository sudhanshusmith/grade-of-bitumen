import { useState, useMemo, useCallback, useEffect } from "react";
import PredictedTemperatureTable from "./PredictedTemperatureTable";
import { Line } from "react-chartjs-2";
import { useUser } from "../context/UserContext";
import {
  Chart as ChartJS,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const DashboardWithControls = () => {
  const [selectedOption, setSelectedOption] = useState("table");
  const {selectedCategory, setSelectedCategory} = useUser();
  const { latitude, longitude, predictedTemp } = useUser();
  const [placeValue, setPlaceValue] = useState('');

    useEffect(() => {
        const storedData = localStorage.getItem('placeValue');
        
        if (storedData) {
            const locationData = JSON.parse(storedData);
            setPlaceValue(locationData.Location); 
        }
    }, [localStorage.getItem('placeValue')]);

  const categoryOptions = useMemo(() => ({
    Normal: "normal",
    Extremevalue: "extreme",
    Logistic: "logistic",
    Tlocationscale: "scale",
    Kernel: "kernel",
    Generalized: "generalized",
    Composite: "composite",
  }), []);

 const handleOptionChange = useCallback((option) => {
    setSelectedOption(option);
  }, []);
  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);


  const accuracyValues = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

  const accuracyMap = useMemo(() => {
    const categoryData = predictedTemp[selectedCategory] || {};
    return Object.keys(categoryData.max_temp || {}).map((key, i) => ({
      x: accuracyValues[i],
      i: i+1,
      yMax: categoryData.max_temp[key],
      yMin: categoryData.min_temp[key],
    }));
  }, [selectedCategory, predictedTemp, accuracyValues]);
  const chartData = useMemo(() => ({
    labels: accuracyMap.map((item) => item.x),
    datasets: [
      {
        label: 'Max Temperature (°C)',
        data: accuracyMap.map((item) => item.yMax),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(233, 223, 225, 0.2)',
        color: '#000000',
      },
      {
        label: 'Min Temperature (°C)',
        data: accuracyMap.map((item) => item.yMin),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        color: '#000000',
      }
    ],
  }), [accuracyMap]);

  
  // Memoized chart data to avoid unnecessary renders
  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#000000', // Set text to black
        },
      },
      title: {
        display: true,
        text: 'Temperature Data',
        color: '#000000', // Set title text to black
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Accuracy (%)',
          color: '#000000', // Set text to black
        },
        ticks: {
          color: '#000000', // Set x-axis ticks to black
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#000000', // Set text to black
        },
        ticks: {
          color: '#000000', // Set y-axis ticks to black
        },
        beginAtZero: true,
      },
    },
  }), []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-screen pt-16">
      <div className="bg-gray-800 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5">
        <div className="grid grid-cols-2 mb-6">
          <button
            onClick={() => handleOptionChange("table")}
            className={`flex-1 p-2 ${selectedOption === "table" ? "bg-blue-600 text-white" : "bg-transparent text-gray-300"} border border-blue-600 rounded-l-lg`}
          >
            Table
          </button>
          <button
            onClick={() => handleOptionChange("graph")}
            className={`flex-1 p-2 ${selectedOption === "graph" ? "bg-blue-600 text-white" : "bg-transparent text-gray-300"} border border-blue-600 rounded-r-lg`}
          >
            Graph
          </button>
        </div>

        {/* Category Dropdown */}
        {predictedTemp && Object.keys(predictedTemp).length > 0 && (
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-300 font-semibold mb-2">Category</label>
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
        <div>
          <p className="text-gray-300 font-semibold"> Location: {placeValue}</p>
          <p className="text-gray-300">{`Latitude: ${latitude}`}</p>
          <p className="text-gray-300">{`Longitude: ${longitude}`}</p>
        </div>
      </div>
        
      {/* Right Section: Table or Graph */}
      <div className="bg-gray-100 bg-opacity-90 text-white shadow-2xl rounded-xl p-10 m-5">
        {selectedOption === "table" ? (
          <PredictedTemperatureTable predictedTemp={predictedTemp} selectedCategory={selectedCategory}/>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default DashboardWithControls;
