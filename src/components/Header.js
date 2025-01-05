import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';

function Header() {
  return (
    <header className="header-root">
      <div className="header-block container-fluid ">
        <div className=" header-block-child row align-items-center">
          <div className="col-3 d-flex align-items-center">
            <img src="/FormaLogo.jpeg" alt="Logo" className="img-fluid me-2" style={{ height: "60px" }} />
            <span className="h5 mb-0 logo">FORMA</span>
          </div>
          <div className="header-btn col-9 d-flex justify-content-center">
            <Link to="/" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Home</Link>
            <Link to="/photographer" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Photographers</Link>
            <Link to="/barber" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Barbers</Link>
            <Link to="/nail-stylist" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Nail Stylists</Link>
            {/*<Link to="/join-us" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Join Us</Link> */}
            <Link to="/about" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">About</Link>
            {/*<Link to="/login" className="btn btn-light rounded-pill btn-sm bg-transparent border-0">Log In</Link>*/}


            {/* Login Icon */}
            
            

          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
