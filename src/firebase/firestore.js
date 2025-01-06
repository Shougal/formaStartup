import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";


//TODO: Should I write to database collection upon registration??

// Add a New Customer
export const addCustomer = async (customerData) => {
  return addDoc(collection(db, "customers"), customerData);
};

// Add a New Provider
export const addProvider = async (providerData) => {
  return addDoc(collection(db, "providers"), providerData);
};

// Get All Customers
export const getCustomers = async () => {
  const querySnapshot = await getDocs(collection(db, "customers"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get All Providers
export const getProviders = async () => {
  const querySnapshot = await getDocs(collection(db, "providers"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update a Document
export const updateDocument = async (collectionName, docId, updatedData) => {
  const docRef = doc(db, collectionName, docId);
  return updateDoc(docRef, updatedData);
};

// Delete a Document
export const deleteDocument = async (collectionName, docId) => {
  const docRef = doc(db, collectionName, docId);
  return deleteDoc(docRef);
};
