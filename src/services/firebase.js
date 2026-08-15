import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpKDls4Vs04kHu5CVV421-rQS3Vi3ia0s",
  authDomain: "cyberhub-backend.firebaseapp.com",
  projectId: "cyberhub-backend",
  storageBucket: "cyberhub-backend.firebasestorage.app",
  messagingSenderId: "932862650615",
  appId: "1:932862650615:web:b96e1ac07dd0c9bcf18bf2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
    app, 
    auth, 
    googleProvider,
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    updateProfile 
};
