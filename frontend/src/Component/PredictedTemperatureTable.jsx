import { useEffect } from 'react';

const PredictedTemperatureTable = ({ predictedTemp, selectedCategory }) => {
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

  const renderTable = () => {
    const categoryData = predictedTemp[selectedCategory];

    // Check if the categoryData exists and has both min_temp and max_temp before rendering
    if (!categoryData || !categoryData.max_temp || !categoryData.min_temp) {
      return <div className="text-gray-400">No data available for this category.</div>;
    }

    return (
      <div className="mt-4">
        <h2 className="text-gray-300 font-semibold mb-4">
          Predicted Temperatures for {selectedCategory}
        </h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">S.No</th>
              <th className="px-4 py-2 text-left text-gray-300">Accuracy (%)</th>
              <th className="px-4 py-2 text-left text-gray-300">Max Temp (°C)</th>
              <th className="px-4 py-2 text-left text-gray-300">Min Temp (°C)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(accuracyMap).map((key, index) => {
              const accuracyIndex = accuracyMap[key];

              // Check if temperature data exists for the current accuracy index
              const maxTemp = categoryData.max_temp[accuracyIndex];
              const minTemp = categoryData.min_temp[accuracyIndex];

              if (maxTemp !== undefined && minTemp !== undefined) {
                return (
                  <tr key={index} className="bg-gray-800">
                    <td className="border px-4 py-2 text-gray-400">{index + 1}</td>
                    <td className="border px-4 py-2 text-gray-400">{key}</td>
                    <td className="border px-4 py-2 text-gray-400">
                      {maxTemp.toFixed(2)}°C
                    </td>
                    <td className="border px-4 py-2 text-gray-400">
                      {minTemp.toFixed(2)}°C
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={index} className="bg-gray-800">
                    <td className="border px-4 py-2 text-gray-400">{index + 1}</td>
                    <td className="border px-4 py-2 text-gray-400">{key}</td>
                    <td className="border px-4 py-2 text-gray-400">N/A</td>
                    <td className="border px-4 py-2 text-gray-400">N/A</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    // Log changes when selectedCategory changes (for debugging)
    console.log('Selected Category Changed:', selectedCategory);
  }, [selectedCategory]); // Add selectedCategory as a dependency

  return (
    <>
      {/* Conditionally render the table */}
      {selectedCategory && predictedTemp && renderTable()}
    </>
  );
};

export default PredictedTemperatureTable;
