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

/** Subscribe to real-time custom vault items (Symbols & Emojis) with userSettings backup */
export function subscribeCustomVaultItems(callback, userUid = null) {
    let activeItems = [];
    const localSaved = (() => {
        try { return JSON.parse(localStorage.getItem('cyberhub_custom_vault_items') || '[]'); } catch { return []; }
    })();
    
    // Load local items first for instant responsiveness
    if (localSaved.length > 0) {
        activeItems = [...localSaved];
        callback(activeItems);
    }

    const mergeAndCallback = (newItems) => {
        const map = new Map();
        [...localSaved, ...activeItems, ...newItems].forEach(item => {
            if (item && item.id) map.set(item.id, item);
        });
        activeItems = Array.from(map.values());
        localStorage.setItem('cyberhub_custom_vault_items', JSON.stringify(activeItems));
        callback(activeItems);
    };

    // 1. Try subscribing to global customVaultItems collection
    let unsubGlobal = () => {};
    try {
        const customCol = collection(db, 'customVaultItems');
        unsubGlobal = onSnapshot(customCol, (snapshot) => {
            const items = [];
            snapshot.forEach((docSnap) => {
                items.push({ id: docSnap.id, ...docSnap.data() });
            });
            mergeAndCallback(items);
        }, (error) => {
            console.warn('Global custom items restricted or pending rules. Using user cloud profile:', error.message);
        });
    } catch (err) {
        console.warn('Global collection subscription error:', err);
    }

    // 2. Also load from user's personal cloud settings
    if (userUid) {
        loadUserSettings(userUid).then(data => {
            if (data?.customVaultItems && Array.isArray(data.customVaultItems)) {
                mergeAndCallback(data.customVaultItems);
            }
        }).catch(() => {});
    }

    return () => {
        unsubGlobal();
    };
}

/** Save a custom symbol or emoji to Firestore cloud with seamless fallback */
export async function saveCustomVaultItem(item, userUid = null) {
    const itemId = item.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullItem = { ...item, id: itemId, updatedAt: Date.now() };

    // 1. Save to local storage for instant access
    try {
        const localList = JSON.parse(localStorage.getItem('cyberhub_custom_vault_items') || '[]');
        const updatedLocal = [fullItem, ...localList.filter(i => i.id !== itemId)];
        localStorage.setItem('cyberhub_custom_vault_items', JSON.stringify(updatedLocal));
    } catch (_) {}

    let savedGlobally = false;

    // 2. Try saving to global customVaultItems collection
    try {
        const docRef = doc(db, 'customVaultItems', itemId);
        await setDoc(docRef, fullItem, { merge: true });
        savedGlobally = true;
    } catch (err) {
        console.warn('Could not write to global collection (permissions). Saving to personal user cloud:', err.message);
    }

    // 3. Always backup to user's personal Firestore document (userSettings) which is guaranteed permitted
    const targetUid = userUid || fullItem.creatorUid;
    if (targetUid && targetUid !== 'anonymous') {
        try {
            const userDoc = await loadUserSettings(targetUid) || {};
            const existingList = userDoc.customVaultItems || [];
            const updatedList = [fullItem, ...existingList.filter(i => i.id !== itemId)];
            await saveUserSettings(targetUid, { customVaultItems: updatedList });
        } catch (e) {
            console.warn('User cloud backup failed:', e);
        }
    }

    return { ok: true, id: itemId, savedGlobally };
}

/** Delete a custom symbol or emoji from Firestore */
export async function deleteCustomVaultItem(itemId, userUid = null) {
    // 1. Remove from local storage
    try {
        const localList = JSON.parse(localStorage.getItem('cyberhub_custom_vault_items') || '[]');
        const updatedLocal = localList.filter(i => i.id !== itemId);
        localStorage.setItem('cyberhub_custom_vault_items', JSON.stringify(updatedLocal));
    } catch (_) {}

    // 2. Try delete from global collection
    try {
        const docRef = doc(db, 'customVaultItems', itemId);
        await deleteDoc(docRef);
    } catch (_) {}

    // 3. Remove from user cloud settings
    if (userUid) {
        try {
            const userDoc = await loadUserSettings(userUid) || {};
            const existingList = userDoc.customVaultItems || [];
            const updatedList = existingList.filter(i => i.id !== itemId);
            await saveUserSettings(userUid, { customVaultItems: updatedList });
        } catch (_) {}
    }

    return { ok: true };
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
