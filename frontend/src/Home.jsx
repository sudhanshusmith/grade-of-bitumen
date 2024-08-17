import React, { useState } from "react";
import CategoryDropdown from "./CategoryDropdown";
import DataToolComponent from "./DataToolComponent";
import Navbar from "./component/Navbar";
import Search from "./Search";

const Home = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [placeValue, setPlaceValue] = useState("");

  const onSendData = (lat, lng, place) => {
    setLatitude(lat);
    setLongitude(lng);
    setPlaceValue(place);
  };

  return (
    <div>
      <Navbar />
      <DataToolComponent />
      {/* <Search onSendData={onSendData} />
      <CategoryDropdown latitude={latitude} longitude={longitude} placeValue={placeValue} /> */}
    </div>
  );
};

export default Home;
