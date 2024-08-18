import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Location, setLocation] = useState(""); // Added for place value
  const [latitude, setLatitude] = useState(null); // Added for latitude
  const [longitude, setLongitude] = useState(null); // Added for longitude

  return (
    <UserContext.Provider value={{ user, setUser, Location, setLocation, latitude, setLatitude, longitude, setLongitude }}>
      {children}
    </UserContext.Provider>
  );
};
