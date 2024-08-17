import React, { useState, useMemo, useEffect } from "react";
import { useCombobox } from "downshift";

function Search({ onSendData }) {
  const [searchResult, setSearchResult] = useState({
    autocompleteSuggestions: [],
    selectedPlace: null,
  });

  const [placeValue, setPlaceValue] = useState(""); // State for place value
  const [latitude, setLatitude] = useState(null); // State for latitude
  const [longitude, setLongitude] = useState(null); // State for longitude

  useEffect(() => {
    // Send the updated data to the parent whenever any of the inputs change
    onSendData({ placeValue, latitude, longitude });
  }, [placeValue, latitude, longitude]); // Removed onSendData to prevent infinite loop

  const google = window.google;
  const service = new google.maps.places.AutocompleteService();
  const sessionToken = useMemo(
    () => new google.maps.places.AutocompleteSessionToken(),
    []
  );

  const { getInputProps, getItemProps, getMenuProps } = useCombobox({
    items: searchResult.autocompleteSuggestions,
    onInputValueChange: async ({ inputValue }) => {
      if (inputValue === "") {
        setSearchResult({
          autocompleteSuggestions: [],
          selectedPlace: null,
        });
        setPlaceValue("");
        setLatitude(null);
        setLongitude(null);
        localStorage.removeItem('placeData'); // Clear localStorage
        return;
      }

      service.getPlacePredictions(
        {
          input: inputValue,
          sessionToken: sessionToken,
        },
        handlePredictions
      );

      function handlePredictions(predictions, status) {
        if (status === "OK") {
          const autocompleteSuggestions = predictions.map((prediction) => ({
            id: prediction.place_id,
            description: prediction.description,
          }));

          setSearchResult({
            autocompleteSuggestions: autocompleteSuggestions,
            selectedPlace: null,
          });
        } else {
          setSearchResult({
            autocompleteSuggestions: [],
            selectedPlace: null,
          });
        }
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ placeId: selectedItem.id }, (results, status) => {
          if (status === "OK") {
            const location = results[0].geometry.location;
            setSearchResult({
              autocompleteSuggestions: [],
              selectedPlace: {
                id: selectedItem.id,
                description: selectedItem.description,
                coordinates: {
                  lat: location.lat(),
                  lng: location.lng(),
                },
              },
            });

            // Update state with place value, latitude, and longitude
            setPlaceValue(selectedItem.description);
            setLatitude(location.lat());
            setLongitude(location.lng());

            // Store in localStorage
            localStorage.setItem('placeData', JSON.stringify({
              placeValue: selectedItem.description,
              latitude: location.lat(),
              longitude: location.lng(),
            }));
          }
        });
      }
    },
  });

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl">
        <div className="relative">
          <div>
            <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-lg">
              <input
                type="text"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Search for a place"
                {...getInputProps()}
              />
            </div>
          </div>

          <div>
            <ul
              {...getMenuProps()}
              className="absolute z-10 bg-white shadow-lg rounded-lg mt-1 w-full"
            >
              {searchResult.autocompleteSuggestions.map((item, index) => (
                <li
                  key={item.id}
                  {...getItemProps({ item, index })}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <i className="fas fa-map-marker-alt text-gray-500"></i>
                  <span className="ml-2">{item.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {searchResult.selectedPlace && (
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <i className="fas fa-map-marker-alt text-blue-500"></i>
                <span>
                  Selected Place: {searchResult.selectedPlace.description}
                </span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <i className="fas fa-location-arrow text-blue-500"></i>
                <span>
                  Coordinates:{" "}
                  {`${searchResult.selectedPlace.coordinates.lat}, ${searchResult.selectedPlace.coordinates.lng}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
