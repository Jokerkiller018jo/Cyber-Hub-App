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
  GoogleAuthProvider as GAuthProvider,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { dataStore } from "./data-store.js";
import { auth as firebaseAuth, googleProvider } from "./firebase-init.js";

// Keep a global reference for the confirmation result
export let windowConfirmationResult = null;

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

/**
 * Initializes the RecaptchaVerifier for Phone Auth
 */
export const setupRecaptcha = (containerId) => {
    window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
        'size': 'normal', // user asked for visible prompt
        'callback': (response) => {
            // reCAPTCHA solved
        },
        'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            if(window.showToast) window.showToast("reCAPTCHA expired. Please solve again.");
        }
    });
};

/**
 * Sends the SMS Verification Code
 */
export const sendSMS = async (phoneNumber) => {
    if (!firebaseAuth.currentUser) throw new Error("Operative not logged in.");
    if (!window.recaptchaVerifier) throw new Error("reCAPTCHA not initialized.");
    
    // We are linking to the current user, but firebase-auth uses signInWithPhoneNumber for the flow
    // To link, we get the credential and link it. But first we need the verification ID.
    // We use the PhoneAuthProvider for this flow.
    const provider = new PhoneAuthProvider(firebaseAuth);
    try {
        const verificationId = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
        return verificationId;
    } catch (error) {
        // Reset recaptcha on error so they can try again
        window.recaptchaVerifier.render().then(function(widgetId) {
            grecaptcha.reset(widgetId);
        });
        throw error;
    }
};

/**
 * Verifies the SMS Code and links the credential
 */
export const verifySMS = async (verificationId, smsCode) => {
    if (!firebaseAuth.currentUser) throw new Error("Operative not logged in.");
    
    const credential = PhoneAuthProvider.credential(verificationId, smsCode);
    try {
        const result = await linkWithCredential(firebaseAuth.currentUser, credential);
        return result.user;
    } catch (error) {
        throw error;
    }
};
