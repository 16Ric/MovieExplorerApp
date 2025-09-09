// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBl2YX5C7xQ6zlSIsZmLOqOpeyj0e3NGyU",
  authDomain: "movieexplorer-84f8d.firebaseapp.com",
  projectId: "movieexplorer-84f8d",
  storageBucket: "movieexplorer-84f8d.firebasestorage.app",
  messagingSenderId: "454970476761",
  appId: "1:454970476761:web:6ac25d9cbdf570807156c8",
  measurementId: "G-GKNVHFEC3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);