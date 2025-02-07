import React from "react";
import "./Footer.css";
import logo from "../assets/FormaLogo.jpeg"; 
import { Link } from "react-router-dom";
import emailjs from 'emailjs-com';


function Footer() {

  const sendEmail = (event) => {
    event.preventDefault();

    emailjs.sendForm('service_ojccfvo', 'template_pdcx4h8', event.target, 'avXKEkyUfZ7-Ga4N_')
      .then((result) => {
          console.log('Email successfully sent!', result.text);
          alert("Message sent successfully!");
      }, (error) => {
          console.log('Failed to send email.', error.text);
          alert("Failed to send message!");
      });
  };
  return (
    <footer className="bg-white py-3 text-black">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <img src={logo} alt="Logo" className="img-fluid me-2" style={{ height: "60px" }} />
            <span className="h5 mb-0 footer-logo">FORMA</span>
            <p className="address-above">Charlottesville</p>  
            <p className="address-bottom">VA 22903</p>
          </div>
          <div className="col-md-4 d-flex flex-column justify-content-center align-items-center footer-button"> 
            <Link to="/photographer" className="footer-button1 btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0 mb-2">Photographers</Link>
            <Link to="/barber" className="footer-button2 btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0 mb-2">Barbers</Link>
            <Link to="/nail-stylist" className="footer-button3 btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0 mb-2">Nail Stylists</Link>
            <Link to="/join-us" className="footer-button4 btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0 mb-2">Join us</Link>
            <Link to="/about" className="footer-button5 btn btn-light rounded-pill btn-sm me-3 bg-transparent border-0">About</Link>
          </div>
          <div className="col-md-4">
            <form className="footer-form" onSubmit={sendEmail}>
              <h1>Contact Us</h1>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="firstName" className="form-label">First name *</label>
                  <input type="text" className="form-control" id="firstName" placeholder="Enter your first name" name="name" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="lastName" className="form-label">Last name *</label>
                  <input type="text" className="form-control" id="lastName" placeholder="Enter your last name" required />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input type="email" className="form-control" id="email" name="email" placeholder="Enter your email" required />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input type="text" className="form-control" id="subject" name="subject" placeholder="Enter subject" />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea className="form-control" id="message" name="message" rows="3" placeholder="Your message" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
