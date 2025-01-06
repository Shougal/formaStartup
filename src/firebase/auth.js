import { auth } from "./firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

// Sign Up with Email and Password
export const signUpWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user; // Return the user object
    } catch (error) {
        console.error("Sign-Up Error:", error.code, error.message);
        throw error; // Rethrow the error for further handling in the UI
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
