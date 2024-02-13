import React, { useState, useMemo } from 'react';
import { useCombobox } from 'downshift';
import axios from 'axios';
import {Button, Card, Typography, TextField, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Paper} from '@mui/material'
import { Menu,TravelExplore,LocationOn,EditLocation,MyLocation,Thermostat  } from '@mui/icons-material';

function Search(){
    
    const [searchResult, setSearchResult] = useState({
        autocompleteSuggestions: [],
        selectedPlace: null,
      });
      const [result, setResult] = useState("")
    
      const google = window.google;
      const service = new google.maps.places.AutocompleteService();
      const sessionToken = useMemo(() => new google.maps.places.AutocompleteSessionToken(), [
        google.maps.places.AutocompleteSessionToken,
      ]);
    
      const {
        getInputProps,
        getItemProps,
        getMenuProps,
      } = useCombobox({
        items: searchResult.autocompleteSuggestions,
        onInputValueChange: async ({ inputValue }) => {
          if (inputValue === '') {
            setSearchResult({
              autocompleteSuggestions: [],
              selectedPlace: null,
            });
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
            if (status === 'OK') {
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
            // Get the coordinates for the selected place
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ placeId: selectedItem.id }, (results, status) => {
              if (status === 'OK') {
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
    
                // Send POST request with coordinates using Axios
                sendPostRequest({
                  lat: location.lat(),
                  lon: location.lng(),
                }, {searchResult});
              }
            });
          }
        },
      });
    
      const sendPostRequest = async (coordinates, {searchResult}) => {
        try {
          // Make a POST request using Axios
          const response = await axios.post('http://localhost:9001/predict', coordinates);
          setResult(response.data.predicted_temp);
          // Handle the response
          console.log('Response from server:', response.data);
    
          // You can update the state or display the result as needed
        } catch (error) {
          // Handle errors
          console.error('Error during POST request:', error);
        }
      };
    
    
    return(
        <div align="center" style={{margin:"-30px 0px 0px 20px"}}>
            <Card variant={"outlined"} style={{width: 1100, minHeight : 400, padding:"20px 5px", marginRight:"20px", marginTop: "50px",borderRadius: "8px", boxShadow:"0px 2px 5px 1px" }}>
                <div style={{ position: 'relative' }}>
                    <div>
                        <Paper
                          component="form"
                          sx={{ p: '10px 4px 8px 4px', display: 'flex', alignItems: 'center', width: 900,  }}
                          elevation={3}
                        >
                          <IconButton sx={{ p: '10px' }} aria-label="menu">
                            <Menu />
                          </IconButton>
                          <TextField style={{ width: "800px", marginTop: "-15px" }} variant="standard" size="small" color='secondary' label="Location"
                            {...getInputProps({ placeholder: 'Search for a place', className: 'search-input' })}
                          />
                          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <TravelExplore />
                          </IconButton>
                        </Paper>
                    </div>
                    <div style={{width:900}}>
                      <List {...getMenuProps()} className="autocomplete-menu">
                        {searchResult.autocompleteSuggestions.map((item, index) => (
                            <ListItem disablePadding key={item.id} {...getItemProps({ item, index })}>
                              <ListItemButton>
                              <ListItemIcon><LocationOn /></ListItemIcon>
                              <ListItemText>{item.description}</ListItemText>
                              </ListItemButton>
                            </ListItem>
                        ))}
                      </List>
                    </div>
                    {searchResult.selectedPlace && (
                    <List style={{width:900}}>
                      <ListItem>
                        <ListItemButton disablePadding>
                        <ListItemIcon><EditLocation /></ListItemIcon>
                          <Typography>Selected Place: {searchResult.selectedPlace.description}</Typography>
                        </ListItemButton>
                      </ListItem>
                      <ListItem>
                        <ListItemButton disablePadding>
                        <ListItemIcon><MyLocation /></ListItemIcon>
                        <Typography>Coordinates: {`${searchResult.selectedPlace.coordinates.lat}, ${searchResult.selectedPlace.coordinates.lng}`}</Typography>
                        </ListItemButton>
                      </ListItem>
                      <ListItem>
                        <ListItemButton disablePadding>
                        <ListItemIcon><Thermostat /></ListItemIcon>
                        <Typography>Temperature: {result}</Typography>
                        </ListItemButton>
                      </ListItem>
                    </List>
                    )}
                </div>
            </Card>
            <br /><br />
        </div>
    )
}


function Map(){

}

export {Search, Map}