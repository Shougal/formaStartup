import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "@firebase/storage";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBka8A3np25fwlbsLN7L9eJLZSO4wBl8SI",
    authDomain: "forma-54f51.firebaseapp.com",
    projectId: "forma-54f51",
    storageBucket: "forma-54f51.firebasestorage.app",
    messagingSenderId: "847979093723",
    appId: "1:847979093723:web:6ac51149965183fac576fe",
    measurementId: "G-7LZ32JV77P"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize a strorage
const storage = getStorage(app);
export { app, db, auth , storage};