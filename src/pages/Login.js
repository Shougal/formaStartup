import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { signInWithGoogle } from "../firebase/auth"; // Your Google login logic
import { useNavigate } from "react-router-dom";
import "./pages.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (!user.emailVerified) {
      setError("Please verify your email before logging in.");
      // Optional: Resend verification email
      await sendVerificationEmail(user);
      alert("A new verification email has been sent to your inbox.");
      return;
    }

    // Proceed to the app
    alert("Login successful!");
    navigate("/");
    } catch (err) {
        //Remove console later
        console.error("Error Code:", err.code); // Log the exact error code
        console.error("Error Message:", err.message);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please register.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password or email. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format. Please check and try again.");
      } else if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          "This account was created using Google. Please log in using Google."
        );
      } else {
        setError("Login failed. Please try again later.");
      }
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setError("");

    try {
      await signInWithGoogle();
      alert("Google login successful!");
      navigate("/");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login popup was closed. Please try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Google login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1 className="form-title">Login</h1>
        {error && <p className="error-message">{error}</p>} {/* Display errors */}
        <form onSubmit={handleLogin}>
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
          <button type="submit" className="form-button">
            Login
          </button>
        </form>
        <button onClick={handleGoogleLogin} className="google-login-button">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
