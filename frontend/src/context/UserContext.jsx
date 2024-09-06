// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Location, setLocation] = useState(""); 
  const [latitude, setLatitude] = useState(null); 
  const [longitude, setLongitude] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedLocation = localStorage.getItem("placeData");
    if (storedLocation) {
      const { Location, latitude, longitude } = JSON.parse(storedLocation);
      setLocation(Location || ""); 
      setLatitude(latitude || null);    
      setLongitude(longitude || null); 
    }
  }, []); 

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, userRole, Location, setLocation, latitude, setLatitude, longitude, setLongitude }}>
      {children}
    </UserContext.Provider>
  );
};
