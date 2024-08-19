import React, { useState } from "react";

const CSVUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/findCsv/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "processed_data.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex items-center space-x-3 py-2">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="border border-gray-300 rounded-md p-2"
      />
      <button
        className="bg-blue-500 text-white  px-2 rounded-lg hover:bg-blue-600"
        onClick={handleUpload}
      >
        Upload & Download
      </button>
    </div>
  );
};

export default CSVUpload;
