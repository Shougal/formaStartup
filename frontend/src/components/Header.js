import React, { useState, useEffect}  from "react";
import "./Header.css";
import { Link} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {logout} from "../api/auth";
function Header() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // const navigate = useNavigate();


    useEffect(() => {
      const handleStorageChange = () => {
        const user = JSON.parse(localStorage.getItem('user'));

        setIsLoggedIn(user && user.isLoggedIn);
      };

      window.addEventListener('storageChange', handleStorageChange);

      // Run once on mount to set initial state
      handleStorageChange();

      return () => {
        window.removeEventListener('storageChange', handleStorageChange);
      };
    }, []);


    const handleLogout = () => {
      // Clear the local storage or authentication tokens
      // localStorage.removeItem('user');
      // setIsLoggedIn(false); // Update local UI state
      // navigate('/login'); // Redirect to login page after logout
        logout();
    };
    return (
    <header className="header-root">
      <div className="header-block container-fluid ">
        <div className=" header-block-child row align-items-center">
          <div className="col-3 d-flex align-items-center">
            <img src="/FormaLogo.jpeg" alt="Logo" className="forma-logo img-fluid me-2" style={{ height: "60px" }} />
            <span className="h5 mb-0 logo">FORMA</span>
          </div>
          <div className="header-btn col-9 d-flex justify-content-center">
            <Link to="/" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Home</Link>
            <Link to="/photographer" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Photographers</Link>
            <Link to="/barber" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Barbers</Link>
            <Link to="/nail-stylist" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Nail Stylists</Link>
            {/*<Link to="/join-us" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Join Us</Link> */}
            <Link to="/about" className=" comming-soon btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">About</Link>
            {/*<Link to="/login" className="btn btn-light rounded-pill btn-sm bg-transparent border-0">Log In</Link>*/}
            {isLoggedIn ? (
                <>
                  <Link to="/userpage" className="btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">Your Page</Link>
                  <button onClick={handleLogout} className="btn btn-light rounded-pill btn-sm bg-transparent border-0">Logout</button>
                </>

            ) : (
            <div
              className=" dropdown-wrapper btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0"
              onMouseEnter={() => {
                setShowDropdown(true);

              }}
              onMouseLeave={() => {
                setShowDropdown(false);

              }}
            >
              <i className="login icon"><FontAwesomeIcon icon={faUser} /></i>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/Login" className="dropdown-item">
                    Login
                  </Link>
                  <Link to="/RegisterCustomer" className="dropdown-item">
                    Join as Customer
                  </Link>
                  <Link to="/RegisterProvider" className="dropdown-item">
                    Join as Service Provider
                  </Link>
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      </div>
    </header>
  );
}


export default Header;
