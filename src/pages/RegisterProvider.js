import React, { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig"; // Import auth and db from your Firebase config
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
        price,
        availability,
        portfolio,
        imageUrl,
        createdAt: new Date(),
      });

      alert("Provider registered successfully!");
      navigate("/"); // Redirect to home page
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h1>Register as a Service Provider</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          required
        />
        <textarea
          placeholder="Price (bullet points)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <textarea
          placeholder="Availability (bullet points)"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Portfolio Link"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterProvider;
