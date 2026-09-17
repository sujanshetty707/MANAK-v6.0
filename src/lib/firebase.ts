import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  indexedDBLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForManakAuth2026',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'manak-compliance.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'manak-compliance',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'manak-compliance.appspot.com',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890abcdef'
};

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const firebaseAuth = getAuth(firebaseApp);

// Configure robust local session persistence
try {
  setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
    setPersistence(firebaseAuth, indexedDBLocalPersistence).catch(() => {
      setPersistence(firebaseAuth, inMemoryPersistence);
    });
  });
} catch {
  // Graceful fallback for non-standard environments
}
