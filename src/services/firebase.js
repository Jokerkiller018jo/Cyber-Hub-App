import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/** Load user settings from Firestore */
export async function loadUserSettings(uid) {
    try {
        const snap = await getDoc(doc(db, 'userSettings', uid));
        if (snap.exists()) return snap.data();
    } catch (_) {}
    return null;
}

/** Save user settings to Firestore */
export async function saveUserSettings(uid, settings) {
    try {
        await setDoc(doc(db, 'userSettings', uid), settings, { merge: true });
        return true;
    } catch (e) {
        console.error('Failed to save settings to Firestore:', e);
        return false;
    }
}

export { 
    app, 
    auth,
    db,
    googleProvider,
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    updateProfile 
};
