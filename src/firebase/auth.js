import { auth } from "./firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";

// Sign Up with Email and Password
export const signUpWithEmail = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");
      return user;
    } catch (error) {
      console.error("Sign-Up Error:", error.message);
      throw error;
    }
  };

// Log In with Email and Password
export const logInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user; // Return the user object
    } catch (error) {
        console.error("Log-In Error:", error.code, error.message);
        throw error;
    }
};

// Log Out
export const logOut = async () => {
    try {
        await signOut(auth);
        console.log("Successfully Logged Out");
    } catch (error) {
        console.error("Log-Out Error:", error.code, error.message);
        throw error;
    }
};

// Sign In with Google
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential.user; // Return the user object
    } catch (error) {
        console.error("Google Sign-In Error:", error.code, error.message);
        throw error;
    }
};

export const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");
      console.log("Verification email sent to:", user.email);
    } catch (error) {
      console.error("Error sending verification email:", error.message);
      throw error;
    }
  };
  export const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      throw error; // Propagate the error to handle it in the UI
    }
  };
