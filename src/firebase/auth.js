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
  return createUserWithEmailAndPassword(auth, email, password);
};

// Log In with Email and Password
export const logInWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Log Out
export const logOut = async () => {
  return signOut(auth);
};

// Sign In with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
