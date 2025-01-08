import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function RegisterCustomer() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleUser, setGoogleUser] = useState(null); // Track Google-authenticated user
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timer, setTimer] = useState(240); // Timer for 4 minutes
  const [isRegistering, setIsRegistering] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [isCanceled, setIsCanceled] = useState(false); // Track cancellation
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    let interval;
    if (isRegistering && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isRegistering, timer]);

  useEffect(() => {
    if (timer <= 180) {
      setResendDisabled(false); // Enable resend after 1 minute
    }
  }, [timer]);

  const validatePassword = () => {
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must include at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must include at least one number.";
    }
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      setSuccessMessage("Verification email sent! Please check your inbox.");
      setIsRegistering(true);

      // Poll for email verification
      pollForVerification(user);
    } catch (authError) {
      console.error("Registration error:", authError.message);
      if (authError.code === "auth/email-already-in-use") {
        setError("The email address is already in use.");
      } else {
        setError("Failed to register. Please try again.");
      }
    }
  };

  const pollForVerification = async (user) => {
    let canceled = false; // Local flag to track cancellation
    const checkEmailVerified = async () => {
      if (canceled || isCanceled) return; // Stop polling if canceled or deleted
      try {
        await user.reload();
        if (user.emailVerified) {
          await setDoc(doc(db, "customers", user.uid), {
            username,
            email,
            createdAt: new Date(),
          });
          alert("Email verified and customer registered successfully!");
          navigate("/"); // Redirect to home
        } else if (timer > 0) {
          setTimeout(checkEmailVerified, 2000); // Retry every 2 seconds
        }
      } catch (err) {
        console.error("Error during verification check:", err.message);
        if (err.code === "auth/user-token-expired") {
          console.log("User token expired, stopping verification checks.");
          canceled = true; // Stop further polling
        }
      }
    };
    checkEmailVerified();
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this is a new user
      if (result._tokenResponse.isNewUser) {
        // Store Google user for linking password later
        setGoogleUser(user);
        alert("Google account authenticated! Please set a password.");
      } else {
        setError("This Google account is already linked to another login method.");
      }
    } catch (err) {
      console.error("Google Sign-Up Error:", err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or reset your password.");
      } else {
        setError("Failed to sign up with Google. Please try again.");
      }
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (googleUser) {
        // Link the password to the Google-authenticated user
        const credential = EmailAuthProvider.credential(googleUser.email, password);
        await linkWithCredential(googleUser, credential);

        // Save user details to Firestore
        await setDoc(doc(db, "customers", googleUser.uid), {
          username: username || googleUser.displayName,
          email: googleUser.email,
          createdAt: new Date(),
        });

        alert("Account linked successfully! You can now log in with your email and password.");
        navigate("/");
      } else {
        setError("Google authentication is required before setting a password.");
      }
    } catch (err) {
      console.error("Error linking password:", err.message);
      if (err.code === "auth/credential-already-in-use") {
        setError("This Google account is already linked to an email account.");
      } else {
        setError("Failed to set password. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setSuccessMessage("Verification email resent! Please check your inbox.");
        setResendDisabled(true);
        setTimeout(() => setResendDisabled(false), 60000); // Re-enable resend after 1 minute
      }
    } catch (err) {
      console.error("Error resending verification email:", err.message);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  const handleTimeout = async () => {
    setIsRegistering(false);
    setTimer(0);
    setError("Verification time expired. Please register again.");
    const user = auth.currentUser;
  
    if (user) {
      console.log("Timeout reached. Attempting to delete user:", user);
  
      try {
        await deleteUser(user); // Attempt to delete the user
        console.log("Unverified user successfully deleted after timeout.");
      } catch (err) {
        console.error("Failed to delete user after timeout:", err.message);
  
        if (err.code === "auth/requires-recent-login") {
          console.warn("User token expired. Unable to delete unverified user.");
          // Optionally, force the user to reauthenticate here
        }
      }
    } else {
      console.warn("No current user found during timeout deletion.");
    }
  };
  

  const handleCancel = async () => {
    setIsCanceled(true); // Mark as canceled
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteUser(user);
        console.log("User registration canceled and account deleted.");
      } catch (err) {
        console.error("Error during cancellation:", err.message);
      }
    }
    setIsRegistering(false);
    setTimer(240); // Reset timer
    setError("Registration canceled. You can register again.");
    setSuccessMessage("");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Join as Customer</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          {!googleUser ? (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Register</button>
              <button
                type="button"
                className="btn btn-danger w-100 mt-3"
                onClick={handleGoogleSignup}
              >
                Sign Up with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={googleUser.displayName || "Enter your username"}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Set Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Set Password</button>
            </form>
          )}

          {isRegistering && (
            <div>
              <p className="text-center mt-3">
                Verification email sent! Please verify your email.
              </p>
              <p className="text-center">Time remaining: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</p>
              <button
                className="btn btn-warning w-100"
                onClick={handleResendVerification}
                disabled={resendDisabled}
              >
                Resend Verification Email
              </button>
              <button className="btn btn-secondary w-100 mt-3" onClick={handleCancel}>
                Cancel Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterCustomer;
