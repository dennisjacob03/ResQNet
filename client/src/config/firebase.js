import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-web-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resqnet-1926e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resqnet-1926e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resqnet-1926e.appspot.com',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };
