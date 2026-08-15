import {
    auth,
    googleProvider,
    signOut,
    onAuthStateChanged,
} from './firebase';

// Maps raw Firebase error codes to human-readable messages
function mapFirebaseError(err) {
    const code = err?.code || '';
    const messages = {
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

export async function loginWithGoogle() {
    try {
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
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
