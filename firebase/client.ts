// Import the functions you need from the SDKs you need
import { initializeApp,  getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYZGvgfrqMVyI3CNYmAp2QX9W6rxzudgU",
  authDomain: "prepwise-e0bac.firebaseapp.com",
  projectId: "prepwise-e0bac",
  storageBucket: "prepwise-e0bac.firebasestorage.app",
  messagingSenderId: "335378935832",
  appId: "1:335378935832:web:6e72472786cd85cb3ad36d",
  measurementId: "G-6007RGN5GW"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp() ;
export const auth = getAuth(app);
export const db = getFirestore(app);