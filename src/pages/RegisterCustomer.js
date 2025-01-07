import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { sendVerificationEmail } from "../firebase/auth"; 
import "./pages.css";

function RegisterCustomer() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUppercase) {
      return "Password must include at least one uppercase letter.";
    }
    if (!hasLowercase) {
      return "Password must include at least one lowercase letter.";
    }
    if (!hasNumber) {
      return "Password must include at least one number.";
    }
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setPassword("");

    const validationError = validatePassword(password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification before writing to doc
      await sendVerificationEmail(user);
      alert("Verification email sent! Please check your inbox and verify your email.");
      
      
      // Polling to check if email is verified
      const checkEmailVerified = async () => {
        await user.reload(); // Reload user state to get the latest emailVerified status
        if (user.emailVerified) {
          // Once verified, save user data to Firestore
          await setDoc(doc(db, "customers", user.uid), {
            username,
            email,
            createdAt: new Date(),
          });
        alert("Email verified and customer registered successfully!");
        navigate("/"); // Redirect user after successful registration
      } else {
        setTimeout(checkEmailVerified, 2000); // Retry every 2 seconds
      }
    };

    checkEmailVerified();
} catch (err) {
  if (err.code === "auth/email-already-in-use") {
    setError("The email address is already in use.");
  } else if (err.code === "auth/weak-password") {
    setError("Password is too weak. Please follow the password requirements.");
  } else if (err.code === "auth/invalid-email") {
    setError("Invalid email format.");
  } else {
    setError("Failed to register. Try again later.");
  }
}
};

  return (
    <div className="page-container">
      <div className="form-container">
        <h1 className="form-title">Join as Customer</h1>
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
            {passwordError && <p className="error-message">{passwordError}</p>}
            <p className="form-hint">
              Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.
            </p>
          </div>
          <button type="submit" className="form-button">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterCustomer;
