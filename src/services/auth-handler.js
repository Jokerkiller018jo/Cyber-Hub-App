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
    linkWithPopup, 
    OAuthProvider, 
    GithubAuthProvider 
} from './firebase';

export let windowConfirmationResult = null;

export const registerUser = async (email, password, username, phone, avatarUrl = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: username, photoURL: avatarUrl });
    return user;
};

export const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
};

export const handleLogout = async () => {
    return signOut(auth);
};

export const observeAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const linkAccount = async (platform) => {
    if (!auth.currentUser) throw new Error("Operative not logged in.");
    let provider;
    if (platform === 'Google') provider = new googleProvider.constructor();
    else if (platform === 'GitHub') provider = new GithubAuthProvider();
    else if (platform === 'Discord') provider = new OAuthProvider('oidc.discord');
    else if (platform === 'Xbox') {
        provider = new OAuthProvider('microsoft.com');
        provider.setCustomParameters({ tenant: 'common' });
    } else {
        throw new Error("Provider not supported yet.");
    }
    
    return linkWithPopup(auth.currentUser, provider);
};

export const setupRecaptcha = (containerId) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            'size': 'normal',
            'callback': (response) => {},
            'expired-callback': () => {
                alert("reCAPTCHA expired. Please solve again.");
            }
        });
    }
};

export const sendSMS = async (phoneNumber) => {
    if (!auth.currentUser) throw new Error("Operative not logged in.");
    if (!window.recaptchaVerifier) throw new Error("reCAPTCHA not initialized.");
    
    const provider = new PhoneAuthProvider(auth);
    try {
        const verificationId = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
        return verificationId;
    } catch (error) {
        window.recaptchaVerifier.render().then(function(widgetId) {
            grecaptcha.reset(widgetId);
        });
        throw error;
    }
};

export const verifySMS = async (verificationId, smsCode) => {
    if (!auth.currentUser) throw new Error("Operative not logged in.");
    const credential = PhoneAuthProvider.credential(verificationId, smsCode);
    const result = await linkWithCredential(auth.currentUser, credential);
    return result.user;
};
