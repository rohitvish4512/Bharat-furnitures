// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe9ACCiybyUKWsz5iWeWU5R3mHHDAYZI0",
  authDomain: "bharat-furnitures.firebaseapp.com",
  projectId: "bharat-furnitures",
  storageBucket: "bharat-furnitures.firebasestorage.app",
  messagingSenderId: "352889925855",
  appId: "1:352889925855:web:83675175e58304ee22396a",
  measurementId: "G-HKMVLL73Z8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);