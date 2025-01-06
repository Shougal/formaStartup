import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./pages.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents form submission from reloading the page
    setError("");  // Clears previous error messages

    try {
      await signInWithEmailAndPassword(auth, email, password);  // Firebase sign-in
      alert("Login successful!");
      navigate("/"); // Navigating to Home page upon successfull login
    } catch (err) {
        // Handling various Firebase authentication errors
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please register.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format. Please check and try again.");
      } else {
        setError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1 className="form-title">Login</h1>
        {error && <p className="error-message">{error}</p>} {/* Displays error messages */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Updates email state
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Updates password state
              required
            />
          </div>
          <button type="submit" className="form-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
