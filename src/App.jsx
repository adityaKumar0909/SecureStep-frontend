// App.jsx
import { useEffect, useState,useRef } from 'react';
import { io } from 'socket.io-client';
import Location_tracking from "./services/location_tracking.jsx";
import Nav from "./components/navbar.jsx";
import {Header} from "./components/header_custom.jsx";
import Footer from "./components/ui/footer.jsx";


function App() {
  return(
  <>
    <Nav/>
    <Header/>
    <Footer/>
  </>
  );
}

export default App;
