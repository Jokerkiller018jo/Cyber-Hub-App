// Firebase Core Initialization - v12
// Replace the config with your own Firebase Project settings from console.firebase.google.com

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpKDls4Vs04kHu5CVV421-rQS3Vi3ia0s",
  authDomain: "cyberhub-backend.firebaseapp.com",
  projectId: "cyberhub-backend",
  storageBucket: "cyberhub-backend.firebasestorage.app",
  messagingSenderId: "932862650615",
  appId: "1:932862650615:web:b96e1ac07dd0c9bcf18bf2"
};

let app, auth, googleProvider;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    // Initialize Auth
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn("NEXUS ALERT: Using placeholder Firebase config. Social features disabled.");
  }
} catch (error) {
  console.error("NEXUS ERROR: Firebase initialization failed.", error);
}

export { auth, googleProvider };
export default app;
