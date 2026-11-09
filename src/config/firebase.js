import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Validate that actual non-placeholder keys are present
export const isFirebaseConfigured = Boolean(
  apiKey &&
  projectId &&
  !apiKey.includes('ExampleKey') &&
  !apiKey.includes('MockKey') &&
  projectId !== 'petal-and-thread-demo'
);

const firebaseConfig = {
  apiKey: apiKey || 'unconfigured-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId || 'petal-and-thread'}.firebaseapp.com`,
  projectId: projectId || 'petal-and-thread-unconfigured',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId || 'petal-and-thread'}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000'
};

if (!isFirebaseConfigured) {
  console.info(
    'ℹ [Petal & Thread] Firebase is running in offline / unconfigured mode.\n' +
    'To connect to live Firebase Authentication & Cloud Firestore, populate your real credentials in .env.'
  );
}

// Safely initialize without duplicating instances during hot reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
export default app;
