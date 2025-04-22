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
import Login from './components/Login';
import RegisterCustomer from './components/RegisterCustomer';
import RegisterProvider from './components/RegisterProvider';
import UserPage from "./pages/UserPage";
import WeekAvailabilityForm from './components/WeekAvailabilityForm';
import ProviderAvailabilityPage from "./components/ProviderAvailabilityPage";
import AppointmentsPage from "./pages/AppointmentsPage";

// import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css'
// import Login from "./pages/Login";
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
            <Route path="/Login" element={<Login />} />
            <Route path="/RegisterCustomer" element={<RegisterCustomer />} />
            <Route path="/RegisterProvider" element={<RegisterProvider />} />
            <Route path="/userpage" element={<UserPage />} />
            <Route path="/set-availability" element={<WeekAvailabilityForm />} />
            <Route path="/availability/provider/:providerId" element={<ProviderAvailabilityPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            {/*<Route path="/login" element={<Login />} />*/}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
