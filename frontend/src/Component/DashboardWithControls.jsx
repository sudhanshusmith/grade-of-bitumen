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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas'; // Required to convert graphs into images for PDF

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
  const { selectedCategory, setSelectedCategory, latitude, longitude, predictedTemp,user } = useUser();
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
      i: i + 1,
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
      },
      {
        label: 'Min Temperature (°C)',
        data: accuracyMap.map((item) => item.yMin),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  }), [accuracyMap]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperature Data',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Accuracy (%)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
        beginAtZero: true,
      },
    },
  }), []);
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Function to add borders on each page
    const addPageBorder = () => {
      doc.setDrawColor(0); // Black color for the border
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 200, 287); // Border dimensions
    };
  
    // Add user and location details on the first page
    doc.setFontSize(16);
    doc.text("Company: BitumenTemp Wizard", 10, 40);
    doc.text(`User: ${user.fullName}`, 10, 50);
    doc.text(`Email: ${user.email}`, 10, 60);
    doc.text(`Location: ${placeValue}`, 10, 70);
    doc.text(`Latitude: ${latitude}`, 10, 80);
    doc.text(`Longitude: ${longitude}`, 10, 90);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 10, 100);
  
    // Add some extra content on the first page to fill it
    doc.setFontSize(12);
    doc.text("Project Details:", 10, 110);
    doc.text("This report includes the predicted temperatures based on varying accuracies for each category, along with graphs representing the trends.", 10, 120);
    doc.text("You can find individual category reports on subsequent pages.", 10, 130);
  
    // Add border to the first page
    addPageBorder();
  
    // Move to the next page for categories
    doc.addPage();
  
    const categories = Object.keys(predictedTemp);
  
    categories.forEach((category, index) => {
      // Add category title
      doc.setFontSize(14);
      doc.text(`Category: ${category}`, 10, 20);
      
      // Add table data for the current category
      const tableData = Object.keys(accuracyMap).map((accuracyKey, idx) => [
        idx + 1,
        accuracyKey,
        predictedTemp[category]?.max_temp?.[accuracyKey]?.toFixed(2) ?? 'N/A',
        predictedTemp[category]?.min_temp?.[accuracyKey]?.toFixed(2) ?? 'N/A',
      ]);
  
      doc.autoTable({
        head: [['S.No', 'Accuracy (%)', 'Max Temp (°C)', 'Min Temp (°C)']],
        body: tableData,
        startY: 30, // Position the table below the title
        styles: { overflow: 'linebreak' },
      });
  
      // Add graph for each category if it exists
      const chartElement = document.querySelector(`#chart-${category}`);
      if (selectedOption === 'graph' && chartElement) {
        html2canvas(chartElement).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, 'PNG', 10, doc.autoTable.previous.finalY + 10, 190, 90); // Adjust dimensions
          addPageBorder(); // Add border after chart
          
          // If it's not the last category, add a new page
          if (index < categories.length - 1) {
            doc.addPage();
          }
  
        }).catch((error) => {
          console.error(`Error capturing chart for category ${category}:`, error);
        });
      } else if (index < categories.length - 1) {
        addPageBorder(); // Add border for table-only page
        doc.addPage(); // Add a new page for the next category
      }
    });
  
    // Save the PDF after processing all categories
    setTimeout(() => {
      doc.save("DashboardReport.pdf");
    }, 1000); // Give some time for all charts to render
  };
  
  
  
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-screen pt-16">
      <div className="bg-gray-800 text-white shadow-2xl rounded-xl p-10 m-5">
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
              {Object.keys(categoryOptions).map((key) => (
                <option key={key} value={categoryOptions[key]}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="text-gray-300 font-semibold">Location: {placeValue}</p>
          <p className="text-gray-300">Latitude: {latitude}</p>
          <p className="text-gray-300">Longitude: {longitude}</p>
        </div>

        <button onClick={downloadPDF} className="bg-green-500 mt-4 text-white py-2 px-4 rounded-lg">
          Download PDF
        </button>
      </div>

      {/* Right Section: Table or Graph */}
      <div className="bg-gray-100 text-white shadow-2xl rounded-xl p-10 m-5">
        {selectedOption === "table" ? (
          <PredictedTemperatureTable predictedTemp={predictedTemp} selectedCategory={selectedCategory} />
        ) : (
          <div id="chart">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWithControls;
