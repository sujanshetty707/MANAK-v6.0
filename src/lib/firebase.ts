import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  indexedDBLocalPersistence,
  inMemoryPersistence
} from 'firebase/auth';

const STORAGE_API_KEY = 'MANAK_FIREBASE_API_KEY';
const STORAGE_PROJECT_ID = 'MANAK_FIREBASE_PROJECT_ID';

export function getStoredFirebaseConfig() {
  try {
    const customApiKey = localStorage.getItem(STORAGE_API_KEY) || '';
    const customProjectId = localStorage.getItem(STORAGE_PROJECT_ID) || '';
    return {
      apiKey: customApiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
      projectId: customProjectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'manak-compliance'
    };
  } catch {
    return {
      apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
      projectId: 'manak-compliance'
    };
  }
}

export function saveStoredFirebaseConfig(apiKey: string, projectId?: string) {
  try {
    if (apiKey.trim()) localStorage.setItem(STORAGE_API_KEY, apiKey.trim());
    if (projectId?.trim()) localStorage.setItem(STORAGE_PROJECT_ID, projectId.trim());
  } catch {
    // Ignore
  }
}

const { apiKey, projectId } = getStoredFirebaseConfig();

const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyDemoPlaceholderKeyForManakAuth2026',
  authDomain: `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890abcdef'
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
  // Graceful fallback
}
