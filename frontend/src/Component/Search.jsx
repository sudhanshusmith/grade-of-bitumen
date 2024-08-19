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

  // useEffect to check if Google Maps is loaded
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        clearInterval(interval);
      }
    }, 100);
  }, []);

  // Initialize google and service only if mapLoaded is true
  const sessionToken = useMemo(() => mapLoaded ? new window.google.maps.places.AutocompleteSessionToken() : null, [mapLoaded]);
  const service = useMemo(() => mapLoaded ? new window.google.maps.places.AutocompleteService() : null, [mapLoaded]);

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
        localStorage.removeItem('placeData'); // Clear localStorage
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
      if (selectedItem && mapLoaded) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: selectedItem.id }, (results, status) => {
          if (status === "OK") {
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
            localStorage.setItem('placeData', JSON.stringify({
              Location: selectedItem.description,
              latitude: lat,
              longitude: lng,
            }));
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
      <div className="bg-white shadow-md rounded-lg p-3 w-full max-w-4xl">
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
        </div>
      </div>
    </div>
  );
}

export default Search;
