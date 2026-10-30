// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ai-resume-builder-95582.firebaseapp.com",
  projectId: "ai-resume-builder-95582",
  storageBucket: "ai-resume-builder-95582.firebasestorage.app",
  messagingSenderId: "608023858567",
  appId: "1:608023858567:web:235517b2c6a38eae791722"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider = new GoogleAuthProvider()
