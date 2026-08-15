import {
    auth,
    googleProvider,
    RecaptchaVerifier,
    PhoneAuthProvider,
    linkWithCredential,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
} from './firebase';

// Maps raw Firebase error codes to human-readable messages
function mapFirebaseError(err) {
    const code = err?.code || '';
    const messages = {
        'auth/invalid-credential':      'Incorrect email or password. Please try again.',
        'auth/wrong-password':          'Incorrect password. Please try again.',
        'auth/user-not-found':          'No account found with this email.',
        'auth/email-already-in-use':    'An account with this email already exists.',
        'auth/weak-password':           'Password must be at least 6 characters.',
        'auth/invalid-email':           'Please enter a valid email address.',
        'auth/too-many-requests':       'Too many failed attempts. Please wait and try again.',
        'auth/network-request-failed':  'Network error. Please check your connection.',
        'auth/user-disabled':           'This account has been disabled. Contact support.',
        'auth/popup-closed-by-user':    'Sign-in popup was closed. Please try again.',
        'auth/popup-blocked':           'Popup was blocked by your browser. Please allow popups.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
        'auth/account-exists-with-different-credential': 
            'An account already exists with this email using a different sign-in method.',
    };
    return messages[code] || err.message || 'An unexpected error occurred. Please try again.';
}

export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

export async function registerUser(email, password, username, phone) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: username });
        return result.user;
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

export async function loginWithGoogle() {
    try {
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

export async function logout() {
    await signOut(auth);
}

export async function handleLogout() {
    await signOut(auth);
}

export function observeAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

// reCAPTCHA is only needed for phone/SMS auth — not for email/password login
let recaptchaVerifier = null;

export function setupRecaptcha(containerId, onSolve) {
    if (recaptchaVerifier) {
        try {
            recaptchaVerifier.clear();
        } catch(e) {}
        recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: (response) => {
            if (onSolve) onSolve(response);
        },
        'expired-callback': () => { recaptchaVerifier = null; }
    });
    recaptchaVerifier.render();
}

export async function sendSMS(phoneNumber) {
    if (!recaptchaVerifier) throw new Error('Recaptcha not initialized');
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
    return verificationId;
}

export async function verifySMS(verificationId, code) {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential);
    }
}
