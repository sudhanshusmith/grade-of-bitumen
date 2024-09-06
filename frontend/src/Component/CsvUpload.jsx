import React, { useState } from "react";
import { useUser } from '../context/UserContext'; // Import the context to get the user role

const CSVUpload = () => {
  const { userRole } = useUser(); // Get the user role from context
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    setIsLoading(true);
    
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
    }
  };

  // Render the component only if the userRole is ADMIN or USER2
  if (userRole === 'ADMIN' || userRole === 'USER2') {
    return (
      <div className="flex items-center space-x-3 py-2">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-md p-2"
        />
        <button
          className="bg-blue-500 text-white px-2 rounded-lg hover:bg-blue-600"
          onClick={handleUpload}
          disabled={isLoading || !file} // Disable button if loading or no file selected
        >
          {isLoading && file ? 'Please Wait...' : 'Upload & Download'}
        </button>
      </div>
    );
  } else {
    return null; // Render nothing if the role is not ADMIN or USER2
  }
};

export default CSVUpload;
