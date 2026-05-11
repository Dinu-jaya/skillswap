import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe-crjxg2LZthN8Pr8pZvVBbXo5wIYPJE",
  authDomain: "skillswap-4c63e.firebaseapp.com",
  projectId: "skillswap-4c63e",
  storageBucket: "skillswap-4c63e.firebasestorage.app",
  messagingSenderId: "152287417999",
  appId: "1:152287417999:web:02759ff7f79056454182fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export default app;
