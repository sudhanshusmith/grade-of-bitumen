import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Location, setLocation] = useState(""); // Added for place value
  const [latitude, setLatitude] = useState(null); // Added for latitude
  const [longitude, setLongitude] = useState(null); // Added for longitude

  useEffect(() => {
    // Check for user data in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for location data in localStorage
    const storedLocation = localStorage.getItem("placeData");
    if (storedLocation) {
      const { Location, latitude, longitude } = JSON.parse(storedLocation);
      setLocation(Location || ""); // Set the location value
      setLatitude(latitude || null);    // Set the latitude value
      setLongitude(longitude || null);  // Set the longitude value
    }
  }, []); // Empty dependency array to run this effect only once when the component mounts

  return (
    <UserContext.Provider value={{ user, setUser, Location, setLocation, latitude, setLatitude, longitude, setLongitude }}>
      {children}
    </UserContext.Provider>
  );
};
