import React from "react";
import logo from "./assets/logo.png";

const DataToolComponent = () => {
  return (
    <div className="flex flex-col items-center mt-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-6xl">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          Welcome to temperature predictions
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 md:col-span-1 flex justify-center items-center">
            <img
              src={logo}
              alt="Image 1"
              className="w-48 h-48 object-cover rounded-lg shadow-lg mb-4 relative p-4"
              style={{ right: "26px" }} // Adjust the value here
            />
          </div>
          <div className="col-span-3 md:col-span-2 flex justify-center items-center">
            <p className="text-gray-700 mb-6">
              Climate Data Online (CDO) provides free access to NCDC's archive
              of global historical weather and climate data in addition to
              station history information. These data include quality controlled
              daily, monthly, seasonal, and yearly measurements of temperature,
              precipitation, wind, and degree days as well as radar data and
              30-year Climate Normals. Customers can also order most of these
              data as certified hard copies for legal use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataToolComponent;
