import React, { useState } from "react";
import * as XLSX from "xlsx";

const DownloadButton = ({ data }) => {
    
  const handleDownload = () => {
    // console.log(data);
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return;
    }

    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, "data.xlsx");
  };

  return (
    <>
    {/* {data.length >= 1  && (<button
      onClick={handleDownload}
      className="ml-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
    >
      Download Data
    </button>)} */}
    </>
    
  );
};

export default DownloadButton;
