// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyoWZS0GheMhdmcOr6b0IMOc0Er5POaoM",
  authDomain: "chadbased-f4111.firebaseapp.com",
  projectId: "chadbased-f4111",
  storageBucket: "chadbased-f4111.appspot.com",
  messagingSenderId: "168102333027",
  appId: "1:168102333027:web:337221e4c548ac99d90656",
  measurementId: "G-F669E8V3LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);