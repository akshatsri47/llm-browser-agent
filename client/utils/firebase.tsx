import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyA07qrnR_18J5VvHXCoO827r9S2tHXvcs4",
    authDomain: "devhouse-33a12.firebaseapp.com",
    projectId: "devhouse-33a12",
    storageBucket: "devhouse-33a12.firebasestorage.app",
    messagingSenderId: "1095136997527",
    appId: "1:1095136997527:web:aadb2e97312084fa25b9d2",
    measurementId: "G-3CQJZS7PBH"
  };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
