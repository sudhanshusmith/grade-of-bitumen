import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./component/Navbar";
import Search from "./component/Search";

function App() {
  return (
    <>      
      <Navbar />
      {/* <Search/> */}
      <Outlet />
    </>
  );
}

export default App;
