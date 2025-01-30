import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Photographer from "./pages/Photographer";
import Barber from "./pages/Barber";
import NailStylist from "./pages/NailStylist";
import About from "./pages/About";
import JoinUs from "./pages/JoinUs";
import Login from "./pages/Login";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <Router>
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
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
