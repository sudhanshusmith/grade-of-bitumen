import { useEffect } from 'react';


const PredictedTemperatureTable = ({
  selectedCategory,
  predictedTemp,
  accuracyMap,
}) => {
  // Function to render the table
  const renderTable = () => {
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
              const categoryData = predictedTemp[selectedCategory];

              if (categoryData) {
                return (
                  <tr key={index} className="bg-gray-800">
                    <td className="border px-4 py-2 text-gray-400">{index + 1}</td>
                    <td className="border px-4 py-2 text-gray-400">{key}</td>
                    <td className="border px-4 py-2 text-gray-400">
                      {categoryData.max_temp[accuracyIndex].toFixed(2)}°C
                    </td>
                    <td className="border px-4 py-2 text-gray-400">
                      {categoryData.min_temp[accuracyIndex].toFixed(2)}°C
                    </td>
                  </tr>
                );
              } else {
                return null;
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
  }, [selectedCategory]); // Add selectedCategory as dependency

  return (
    <>
      {/* Conditionally render the table */}
      {selectedCategory && predictedTemp && renderTable()}
    </>
  );
};

export default PredictedTemperatureTable;
