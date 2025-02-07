import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <h1 className="display-1 fw-bold mb-4 message">
            Find and Book Local <br />
            <span className="fw-bold">Services</span>
          </h1>
          <div className="d-flex justify-content-center gap-3 mb-3">
            {/* Use Link components instead of <a> */}
            <Link to="/photographer" className="btn btn-primary rounded-pill btn-lg bg-white fs-1 fs-lg-2 hero-button">
              Photographers
            </Link>
            <Link to="/barber" className="btn btn-primary rounded-pill btn-lg bg-white fs-1 fs-lg-2 hero-button">
              Barbers
            </Link>
            <Link to="/nail-stylist" className="btn btn-primary rounded-pill btn-lg bg-white fs-1 fs-lg-2 hero-button">
              Nail Stylists
            </Link>
          </div>
          <p className="text-muted">Click to explore local talents!</p>
        </div>
      </section>
    </main>
  );
}

export default Home;
