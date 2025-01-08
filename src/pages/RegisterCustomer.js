import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  deleteUser,
  reauthenticateWithCredential,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

function RegisterCustomer() {
  /**************************************************************************
   * 1) STATE HOOKS
   *************************************************************************/
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // We'll store password in state so we can reauth if needed
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // If user signs in with Google, store that user object
  const [googleUser, setGoogleUser] = useState(null);

  // For showing errors and success messages in the UI
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 4-minute timer => 240 seconds
  const [timer, setTimer] = useState(240);
  const [isRegistering, setIsRegistering] = useState(false);

  // Resend is initially disabled; enable after 1 minute
  const [resendDisabled, setResendDisabled] = useState(true);

  // Track if user canceled
  const [isCanceled, setIsCanceled] = useState(false);

  // For navigation
  const navigate = useNavigate();

  // Google auth provider (optional)
  const googleProvider = new GoogleAuthProvider();

  /**************************************************************************
   * 2) useEffect: CLEAN UP UNVERIFIED USER IF PAGE REFRESHED
   *************************************************************************/
  useEffect(() => {
    const regInProgress = localStorage.getItem("registrationInProgress");
    if (regInProgress === "true") {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        console.log("Page refreshed mid-registration. Attempting to delete user.");
        deleteUser(user)
          .then(() => {
            console.log("Unverified user deleted on page mount.");
          })
          .catch((err) => {
            // If deletion fails, just log it and reset
            console.error("Failed to delete user on mount:", err.code, err.message);
          })
          .finally(() => {
            localStorage.removeItem("registrationInProgress");
          });
      } else {
        console.log("No unverified user to delete on mount or user is verified.");
        localStorage.removeItem("registrationInProgress");
      }
    }
  }, []);

  /**************************************************************************
   * 3) useEffect: TIMER LOGIC
   *************************************************************************/
  useEffect(() => {
    let interval;
    if (isRegistering && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } 
    else if (timer === 0 && isRegistering) {
      console.log("Timer expired -> handleTimeout");
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [isRegistering, timer]);

  /**************************************************************************
   * 4) ENABLE RESEND AFTER 1 MIN
   *************************************************************************/
  useEffect(() => {
    // Timer starts at 240. After 60s, timer=180 => 1 minute passed
    if (isRegistering && timer <= 180) {
      setResendDisabled(false);
    }
  }, [isRegistering, timer]);

  /**************************************************************************
   * 5) HELPER: Check if Email Already Exists
   *************************************************************************/
  const checkEmailExists = async (email) => {
    // 5a) Check in Auth
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      return true; // Email is already in use in Firebase Auth
    }

    // 5b) Optional - Check Firestore "customers" collection
    const q = query(collection(db, "customers"), where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      // There's a doc with that email
      return true;
    }
    return false;
  };

  /**************************************************************************
   * 6) HELPER: Validate Password
   *************************************************************************/
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

  /**************************************************************************
   * 7) HELPER: Reauthenticate if needed
   *************************************************************************/
  const reauthenticateUser = async (user, pwd) => {
    if (!pwd) {
      console.warn("No password provided, cannot reauthenticate.");
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, pwd);
      await reauthenticateWithCredential(user, credential);
      console.log("Reauthentication successful");
      return true;
    } catch (err) {
      console.error("Reauth failed:", err.code, err.message);
      return false;
    }
  };

  /**************************************************************************
   * 8) REGISTER
   *************************************************************************/
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if email used
    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setError("This email is already in use.");
        return;
      }
    } catch (err) {
      console.error("Email check failed:", err);
      setError("Failed to verify email. Try again.");
      return;
    }

    try {
      setIsRegistering(true); // disable register button
      localStorage.setItem("registrationInProgress", "true");

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setSuccessMessage("Verification email sent! Please check your inbox.");

      pollForVerification(user);
    } catch (authError) {
      console.error("Registration error:", authError.message);
      setIsRegistering(false); // allow re-try
      if (authError.code === "auth/email-already-in-use") {
        setError("The email address is already in use.");
      } else {
        setError("Failed to register. Please try again.");
      }
    }
  };

  /**************************************************************************
   * 9) POLL FOR VERIFICATION
   *************************************************************************/
  const pollForVerification = (user) => {
    let canceled = false;

    const checkEmailVerified = async () => {
      if (canceled || isCanceled) return;

      try {
        await user.reload();
        if (user.emailVerified) {
          // Once verified, remove localStorage flag
          localStorage.removeItem("registrationInProgress");

          // Write doc
          await setDoc(doc(db, "customers", user.uid), {
            username,
            email,
            createdAt: new Date(),
          });
          alert("Email verified and customer registered successfully!");
          navigate("/"); // go to home or login
        } else if (timer > 0) {
          setTimeout(checkEmailVerified, 2000); // check again in 2s
        }
      } catch (err) {
        console.error("Error during verification check:", err.code, err.message);
        if (err.code === "auth/user-token-expired") {
          console.warn("User token expired. Stopping verification checks.");
          canceled = true;
        }
      }
    };

    checkEmailVerified();
  };

  /**************************************************************************
   * 10) TIMEOUT => DELETE UNVERIFIED USER
   *************************************************************************/
  const handleTimeout = async () => {
    setIsRegistering(false);
    setTimer(0);
    setError("Verification time expired. Please register again.");

    const user = auth.currentUser;
    if (!user) {
      console.warn("No user found to delete at timeout.");
      localStorage.removeItem("registrationInProgress");
      return;
    }
    console.log("Timeout -> reauth & delete user:", user.email);

    try {
      // 10a) Reauthenticate user if they used email/password
      const reauthed = await reauthenticateUser(user, password);
      if (!reauthed) {
        console.warn("Could not reauth. Attempting delete anyway...");
      }

      await deleteUser(user);
      console.log("Unverified user deleted after 4-min timeout.");
    } catch (err) {
      console.error("Failed to delete user after timeout:", err.code, err.message);

      // Instead of crashing, we reset the flow:
      setError("Verification time expired. Please register again.");
    } finally {
      // Cleanup
      setIsRegistering(false);
      setTimer(240);
      localStorage.removeItem("registrationInProgress");
    }
  };

  /**************************************************************************
   * 11) CANCEL => DELETE USER
   *************************************************************************/
  const handleCancel = async () => {
    setIsCanceled(true);

    const user = auth.currentUser;
    if (!user) {
      console.warn("No user found on cancel.");
      resetRegistration("Registration canceled. You can register again.");
      return;
    }

    console.log("Cancel -> reauth & delete user:", user.email);
    try {
      const reauthed = await reauthenticateUser(user, password);
      if (!reauthed) {
        console.warn("Could not reauth. Attempting delete anyway...");
      }

      await deleteUser(user);
      console.log("User registration canceled -> user deleted.");
    } catch (err) {
      console.error("Error during cancellation:", err.code, err.message);
      // Instead of crashing, we reset the flow:
      setError("Registration canceled. Please register again.");
    } finally {
      resetRegistration("Registration canceled. You can register again.");
    }
  };

  /**************************************************************************
   * 11b) HELPER: RESET REGISTRATION FLOW
   *************************************************************************/
  const resetRegistration = (msg) => {
    // Generic helper if you want to clean up user state
    setIsRegistering(false);
    setTimer(240);
    setSuccessMessage("");
    setError(msg);
    localStorage.removeItem("registrationInProgress");
  };

  /**************************************************************************
   * 12) RESEND VERIFICATION
   *************************************************************************/
  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setSuccessMessage("Verification email resent! Please check your inbox.");
        setResendDisabled(true);

        // Re-enable after 60 seconds
        setTimeout(() => {
          setResendDisabled(false);
        }, 60000);
      }
    } catch (err) {
      console.error("Error resending verification email:", err.message);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  /**************************************************************************
   * 13) GOOGLE SIGNUP (OPTIONAL)
   *************************************************************************/
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (result._tokenResponse.isNewUser) {
        setGoogleUser(user);
        alert("Google account authenticated! Please set a password.");
      } else {
        setError("This Google account is already linked to another login method.");
      }
    } catch (err) {
      console.error("Google Sign-Up Error:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in or reset your password.");
      } else {
        setError("Failed to sign up with Google. Please try again.");
      }
    }
  };

  /**************************************************************************
   * 14) SET PASSWORD IF USER SIGNED UP WITH GOOGLE
   *************************************************************************/
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (!googleUser) {
        setError("Google authentication is required before setting a password.");
        return;
      }
      const credential = EmailAuthProvider.credential(googleUser.email, password);
      await linkWithCredential(googleUser, credential);

      await setDoc(doc(db, "customers", googleUser.uid), {
        username: username || googleUser.displayName,
        email: googleUser.email,
        createdAt: new Date(),
      });

      alert("Account linked successfully! You can now log in with email and password.");
      navigate("/");
    } catch (err) {
      console.error("Error linking password:", err.message);
      if (err.code === "auth/credential-already-in-use") {
        setError("This Google account is already linked to an email account.");
      } else {
        setError("Failed to set password. Please try again.");
      }
    }
  };

  /**************************************************************************
   * 15) RENDER
   *************************************************************************/
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Join as Customer</h1>

          {/* Error & success UI */}
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          {/* If googleUser is null, show standard signup */}
          {!googleUser ? (
            <form onSubmit={handleRegister}>
              {/* USERNAME */}
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

              {/* EMAIL */}
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

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isRegistering}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isRegistering}
                />
              </div>

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isRegistering}
              >
                Register
              </button>

              {/* OPTIONAL: Google Sign-up Button */}
              <button
                type="button"
                className="btn btn-danger w-100 mt-3"
                onClick={handleGoogleSignup}
              >
                Sign Up with Google
              </button>
            </form>
          ) : (
            /* If googleUser is set, show "Set Password" form */
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

          {/* If we're in the "registering" phase, show timer/resend/cancel UI */}
          {isRegistering && (
            <div>
              <p className="text-center mt-3">
                Verification email sent! Please verify your email.
              </p>
              <p className="text-center">
                Time remaining: {Math.floor(timer / 60)}:
                {String(timer % 60).padStart(2, "0")}
              </p>

              <button
                className="btn btn-warning w-100"
                onClick={handleResendVerification}
                disabled={resendDisabled}
              >
                Resend Verification Email
              </button>

              <button
                className="btn btn-secondary w-100 mt-3"
                onClick={handleCancel}
              >
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
