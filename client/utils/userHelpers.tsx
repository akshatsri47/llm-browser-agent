// utils/userHelpers.ts
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createUserDocument = async (user: User) => {
  const userDocRef = doc(db, "users", user.uid);
  
  await setDoc(userDocRef, {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    googleAccounts: [user.email], // Array of linked Google accounts
    password: "", // Empty since using Google Auth
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }, { merge: true }); // Merge if document exists
};