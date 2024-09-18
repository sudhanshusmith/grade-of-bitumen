import { useCombobox } from "downshift";
import { useUser } from "../context/UserContext"; // Import the context
import { useEffect, useMemo, useState } from "react";

function Search() {
  const { Location, setLocation, latitude, setLatitude, longitude, setLongitude } = useUser();

  const [searchResult, setSearchResult] = useState({
    autocompleteSuggestions: [],
    selectedPlace: null,
  });

  const [mapLoaded, setMapLoaded] = useState(false);

  // useEffect to check if Google Maps is loaded more efficiently
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
    }
  }, []);

  // Initialize google and service only if mapLoaded is true
  const sessionToken = useMemo(() => (mapLoaded ? new window.google.maps.places.AutocompleteSessionToken() : null), [mapLoaded]);
  const service = useMemo(() => (mapLoaded ? new window.google.maps.places.AutocompleteService() : null), [mapLoaded]);

  const { getInputProps, getItemProps, getMenuProps } = useCombobox({
    items: searchResult.autocompleteSuggestions,
    onInputValueChange: async ({ inputValue }) => {
      if (inputValue === "") {
        setSearchResult({
          autocompleteSuggestions: [],
          selectedPlace: null,
        });
        setLocation("");
        setLatitude(null);
        setLongitude(null);
        localStorage.removeItem("placeData"); // Clear localStorage
        return;
      }

      if (service) {
        service.getPlacePredictions(
          {
            input: inputValue,
            sessionToken: sessionToken,
          },
          handlePredictions
        );
      }

      function handlePredictions(predictions, status) {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
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
      if (selectedItem && mapLoaded) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: selectedItem.id }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            setSearchResult({
              autocompleteSuggestions: [],
              selectedPlace: {
                id: selectedItem.id,
                description: selectedItem.description,
                coordinates: {
                  lat: lat,
                  lng: lng,
                },
              },
            });

            // Update context with place value, latitude, and longitude
            setLocation(selectedItem.description);
            setLatitude(lat);
            setLongitude(lng);

            // Store in localStorage
            const placeData = {
              Location: selectedItem.description,
              latitude: lat,
              longitude: lng,
            };

            localStorage.setItem("placeData", JSON.stringify(placeData));
          }
        });
      }
    },
  });

  if (!mapLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center mt-1">
      <div className="bg-gray-800 shadow-lg rounded-lg p-2 w-full max-w-4xl mb-5">
        <div className="relative">
          {/* Search Input */}
          <div className="flex items-center space-x-4 bg-gray-900 p-4 rounded-lg">
            <input
              type="text"
              className="w-full bg-transparent text-white border-gray-700 rounded-lg focus:outline-none focus:ring-0"
              placeholder="Search for a place"
              {...getInputProps()}
            />
          </div>

          {/* Suggestions Menu */}
          <div>
            <ul
              {...getMenuProps()}
              className="absolute z-10 bg-gray-800 shadow-lg rounded-lg mt-1 w-full max-h-60 overflow-y-auto"
            >
              {searchResult.autocompleteSuggestions.map((item, index) => (
                <li
                  key={item.id}
                  {...getItemProps({ item, index })}
                  className="p-3 hover:bg-gray-700 cursor-pointer flex items-center"
                >
                  <i className="fas fa-map-marker-alt text-gray-400"></i>
                  <span className="ml-3 text-white">{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
