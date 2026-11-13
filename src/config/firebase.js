import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();

const PLACEHOLDER_PATTERN = /(ExampleKey|MockKey|unconfigured|placeholder|your_|petal-and-thread-demo|123456789012|abcdef1234567890|000000000000)/i;

// Validate that actual non-placeholder credentials are present before initializing Firebase
export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey.length >= 20 &&
  projectId &&
  authDomain &&
  appId &&
  !PLACEHOLDER_PATTERN.test(apiKey) &&
  !PLACEHOLDER_PATTERN.test(projectId) &&
  !PLACEHOLDER_PATTERN.test(appId)
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
    ...(messagingSenderId ? { messagingSenderId } : {}),
    appId
  };

  // Safely initialize without duplicating instances during hot reloads
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.info(
    'ℹ [Petal & Thread] Firebase is not configured with live credentials.\n' +
    'Populate real VITE_FIREBASE_* values in .env and restart the dev server to enable Firebase Authentication.'
  );
}

export { app, auth, db };
export default app;
