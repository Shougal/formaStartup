import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig"; // Ensure correct paths
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./pages.css";

function RegisterProvider() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save provider-specific data in Firestore
      await setDoc(doc(db, "providers", user.uid), {
        username,
        email,
        specialty,
        price: price.split("\n"), // Store price as an array of bullet points
        availability: availability.split("\n"), // Store availability as an array
        portfolio,
        imageUrl,
        createdAt: new Date(),
      });

      alert("Provider registered successfully!");
      navigate("/");
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1 className="form-title">Join as Service Provider</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (one per line)</label>
            <textarea
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Add prices (e.g., Package A: $100)"
              required
            />
          </div>
          <div className="form-group">
            <label>Availability (one per line)</label>
            <textarea
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Add availability (e.g., Mon-Fri: 9AM - 5PM)"
              required
            />
          </div>
          <div className="form-group">
            <label>Portfolio Link</label>
            <input
              type="url"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="Add your portfolio link"
              required
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Add the link to your profile image"
              required
            />
          </div>
          <button type="submit" className="form-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterProvider;
