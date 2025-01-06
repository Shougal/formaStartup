import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Photographer from "./pages/Photographer";
import Barber from "./pages/Barber";
import NailStylist from "./pages/NailStylist";
import About from "./pages/About";
import JoinUs from "./pages/JoinUs";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterProvider from "./pages/RegisterProvider";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <div>
    <Header />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photographer" element={<Photographer />} />
        <Route path="/barber" element={<Barber />} />
        <Route path="/nail-stylist" element={<NailStylist />} />
        <Route path="/about" element={<About />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/RegisterCustomer" element={<RegisterCustomer />} />
        <Route path="/RegisterProvider" element={<RegisterProvider />} />
      </Routes>
    </main>
    <Footer />
  </div>
  );
}

export default App;
