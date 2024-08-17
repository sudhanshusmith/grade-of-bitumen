import React from 'react';

const DataToolComponent = () => {
  return (
    <div className="flex flex-col items-center mt-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-6xl">
        <div className="relative flex justify-between items-start">
          
          {/* Left Column with Text */}
          <div className="w-2/3">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">XYZ</h2>
            <p className="text-gray-700 mb-6">
              Climate Data Online (CDO) provides free access to NCDC's archive of global historical weather and climate data in addition to station history information. These data include quality controlled daily, monthly, seasonal, and yearly measurements of temperature, precipitation, wind, and degree days as well as radar data and 30-year Climate Normals. Customers can also order most of these data as certified hard copies for legal use.
            </p>

            

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">DISCOVER DATA BY</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-center text-xl font-semibold text-gray-700">SEARCH TOOL</h3>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-center text-xl font-semibold text-gray-700">MAPPING TOOL</h3>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-center text-xl font-semibold text-gray-700">DATA TOOL</h3>
              </div>
            </div>
          </div>

          {/* Right Column with Overlapping Photos */}
          <div className="w-1/3 relative flex flex-col items-end">
            <img
              src="image1.jpg"
              alt="Image 1"
              className="w-48 h-48 object-cover rounded-lg shadow-lg mb-4 relative"
              style={{ right: '26px' }}  // Adjust the value here
            />
            <img
              src="image2.jpg"
              alt="Image 2"
              className="w-48 h-48 object-cover rounded-lg shadow-lg -mt-20 ml-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataToolComponent;
