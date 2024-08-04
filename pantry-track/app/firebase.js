// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2QYpORMi6Y4q8PrB6ECQAvyQQKOUTMNY",
  authDomain: "pantry-tracker-cb38f.firebaseapp.com",
  projectId: "pantry-tracker-cb38f",
  storageBucket: "pantry-tracker-cb38f.appspot.com",
  messagingSenderId: "1010970043388",
  appId: "1:1010970043388:web:0c98ce20774ff9da740879",
  measurementId: "G-EBQP7RRYEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app);