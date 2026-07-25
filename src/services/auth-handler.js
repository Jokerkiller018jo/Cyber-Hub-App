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
} from './firebase';

export async function loginWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

export async function registerUser(email, password, username, phone) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: username });
    return result.user;
}

export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
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

let recaptchaVerifier = null;

export function setupRecaptcha(containerId) {
    if (recaptchaVerifier) return;
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: () => {},
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
