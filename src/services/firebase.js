import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut, 
    onAuthStateChanged, 
    updateProfile 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    deleteDoc, 
    collection, 
    onSnapshot, 
    getDocs 
} from "firebase/firestore";

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
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
        return { ok: true };
    } catch (e) {
        console.error('Failed to save settings to Firestore:', e);
        return { ok: false, error: e.message || 'Unknown error' };
    }
}

/** Subscribe to real-time custom vault items (Symbols & Emojis) */
export function subscribeCustomVaultItems(callback) {
    try {
        const customCol = collection(db, 'customVaultItems');
        return onSnapshot(customCol, (snapshot) => {
            const items = [];
            snapshot.forEach((docSnap) => {
                items.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(items);
        }, (error) => {
            console.warn('Custom vault items subscription fallback:', error);
            // Fallback: one-time load
            getDocs(customCol).then((snapshot) => {
                const items = [];
                snapshot.forEach((docSnap) => {
                    items.push({ id: docSnap.id, ...docSnap.data() });
                });
                callback(items);
            }).catch(() => callback([]));
        });
    } catch (err) {
        console.error('Failed to subscribe to custom vault items:', err);
        return () => {};
    }
}

/** Save a custom symbol or emoji to Firestore cloud */
export async function saveCustomVaultItem(item) {
    try {
        const itemId = item.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const docRef = doc(db, 'customVaultItems', itemId);
        await setDoc(docRef, { ...item, id: itemId, updatedAt: Date.now() }, { merge: true });
        return { ok: true, id: itemId };
    } catch (err) {
        console.error('Failed to save custom vault item:', err);
        return { ok: false, error: err.message || 'Failed to save to cloud' };
    }
}

/** Delete a custom symbol or emoji from Firestore */
export async function deleteCustomVaultItem(itemId) {
    try {
        const docRef = doc(db, 'customVaultItems', itemId);
        await deleteDoc(docRef);
        return { ok: true };
    } catch (err) {
        console.error('Failed to delete custom vault item:', err);
        return { ok: false, error: err.message || 'Failed to delete from cloud' };
    }
}

export { 
    app, 
    auth, 
    db, 
    googleProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut, 
    onAuthStateChanged, 
    updateProfile 
};
