// src/components/MapComponent.js
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useUser } from '../context/UserContext'; // Adjust path as necessary

// Container style for Google Maps
const containerStyle = {
  width: '100%',
  height: '400px',
};

// Default center for the map
const defaultCenter = {
  lat: 40.748817,
  lng: -73.985428,
};

const MapComponent = ({ predictedTemp }) => {
  const { latitude, longitude } = useUser(); // Use context to get latitude and longitude

  // Google Maps API Key
  const googleMapsApiKey = 'AIzaSyCdNjPOM_CirNn42mLR18gouaL8-if6Xfo';

  // Determine center based on context or default
  const center = latitude !== null && longitude !== null 
    ? { lat: latitude, lng: longitude }
    : defaultCenter;

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mt-20">
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10} // Adjust zoom level here
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
      <p className="text-gray-300">Latitude: {latitude !== null ? latitude : 'Loading...'}</p>
      <p className="text-gray-300">Longitude: {longitude !== null ? longitude : 'Loading...'}</p>
      <p className="text-gray-300">Predicted Temp: {predictedTemp}°C</p>
    </div>
  );
};

export default MapComponent;
