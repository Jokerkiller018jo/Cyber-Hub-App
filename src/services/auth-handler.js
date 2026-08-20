import {
    auth,
    googleProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from './firebase';

// Maps raw Firebase error codes to human-readable messages
function mapFirebaseError(err) {
    const code = err?.code || '';
    const messages = {
        'auth/network-request-failed':  'Network error. Please check your connection.',
        'auth/user-disabled':           'This account has been disabled. Contact support.',
        'auth/user-not-found':          'No account found with this email.',
        'auth/wrong-password':          'Incorrect password. Please try again.',
        'auth/invalid-credential':      'Invalid email or password.',
        'auth/email-already-in-use':    'An account already exists with this email.',
        'auth/weak-password':           'Password should be at least 6 characters.',
        'auth/invalid-email':           'Please enter a valid email address.',
        'auth/popup-closed-by-user':    'Sign-in popup was closed. Redirecting...',
        'auth/popup-blocked':           'Popup was blocked by your browser. Redirecting...',
        'auth/cancelled-popup-request': 'Sign-in request was updated.',
        'auth/account-exists-with-different-credential': 
            'An account already exists with this email using a different sign-in method.',
    };
    return messages[code] || err.message || 'An unexpected error occurred. Please try again.';
}

/** Check if user is returning from a redirect authentication flow */
export async function checkRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
            return result.user;
        }
    } catch (err) {
        console.error('Redirect result check error:', err);
    }
    return null;
}

/** Direct Redirect Google Sign-in (100% reliable without popups) */
export async function loginWithGoogleRedirect() {
    try {
        await signInWithRedirect(auth, googleProvider);
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

/** Hybrid Google Sign-in: tries popup, automatically falls back to redirect if popup is blocked/closed */
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (err) {
        const code = err?.code || '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
            console.log('Popup blocked or closed in webview; falling back to direct redirect sign-in...');
            await signInWithRedirect(auth, googleProvider);
            return null;
        }
        throw new Error(mapFirebaseError(err));
    }
}

/** Email and Password Login */
export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (err) {
        throw new Error(mapFirebaseError(err));
    }
}

/** Email and Password Registration */
export async function registerWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
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
