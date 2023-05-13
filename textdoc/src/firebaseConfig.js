// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCft-GZpU7vEZBDhtD1oArCmUwbElIMtAY",
  authDomain: "textdoc-518a4.firebaseapp.com",
  projectId: "textdoc-518a4",
  storageBucket: "textdoc-518a4.appspot.com",
  messagingSenderId: "1073804091604",
  appId: "1:1073804091604:web:47cd1fd3e72491c4f31b41"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app)