// Authentication Handler - v12
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  linkWithPopup,
  OAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider as GAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { dataStore } from "./data-store.js";
import { auth as firebaseAuth, googleProvider } from "./firebase-init.js";

/**
 * Registers a user using email and password.
 * Syncs profile metadata to localStorage via dataStore.
 */
export const registerUser = async (email, password, username, phone, avatarUrl = "") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    // Set display name and photoURL on the Auth profile
    await updateProfile(user, { displayName: username, photoURL: avatarUrl });

    // Sync to Local Data Store
    dataStore.setUser(user.uid, {
        username: username,
        email: email,
        phone: phone,
        avatar: avatarUrl,
        status: "Available",
        online: true,
        createdAt: Date.now()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Logs in a user using Google Sign-In and syncs profile.
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const user = result.user;

    // Sync to Local Data Store if new or updated
    dataStore.setUser(user.uid, {
        username: user.displayName || "Ghost Operative",
        email: user.email,
        avatar: user.photoURL || "",
        online: true
    });

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Signs the current user out.
 */
export const handleLogout = async () => {
  return signOut(firebaseAuth);
};

/**
 * Observes the authentication state changes.
 */
/**
 * Observes the authentication state changes.
 */
export const observeAuth = (callback) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

/**
 * Links a third-party provider to the current user.
 */
export const linkAccount = async (platform) => {
    if (!firebaseAuth.currentUser) throw new Error("Operative not logged in.");
    let provider;
    if (platform === 'Google') provider = new GAuthProvider();
    else if (platform === 'GitHub') provider = new GithubAuthProvider();
    else if (platform === 'Discord') provider = new OAuthProvider('oidc.discord');
    else if (platform === 'Xbox') {
        provider = new OAuthProvider('microsoft.com');
        provider.setCustomParameters({ tenant: 'common' });
    } else {
        throw new Error("Provider not supported yet.");
    }
    
    return linkWithPopup(firebaseAuth.currentUser, provider);
};
