import './env.js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isInitialized = false;
let adminAuth = null;
let adminDb = null;

/**
 * Deterministically locates serviceAccountKey.json independent of process.cwd().
 * Checks environment override, server/config co-location, and project directories.
 */
function resolveServiceAccountPath() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidatePaths = [];

  if (envPath) {
    if (path.isAbsolute(envPath)) {
      candidatePaths.push(envPath);
    } else {
      // Resolve relative to server/config, server root, and current working dir
      candidatePaths.push(path.resolve(__dirname, envPath));
      candidatePaths.push(path.resolve(__dirname, '..', envPath));
      candidatePaths.push(path.resolve(process.cwd(), envPath));
    }
  }

  // Standard locations: server/config/serviceAccountKey.json
  candidatePaths.push(path.join(__dirname, 'serviceAccountKey.json'));
  candidatePaths.push(path.join(__dirname, '..', 'serviceAccountKey.json'));
  candidatePaths.push(path.join(__dirname, '..', '..', 'serviceAccountKey.json'));

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return null;
}

try {
  if (admin.apps.length > 0) {
    isInitialized = true;
  } else {
    const resolvedPath = resolveServiceAccountPath();

    if (resolvedPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
      });
      isInitialized = true;
      console.log(`✔ Firebase Admin SDK initialized using service account: ${resolvedPath}`);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.NODE_ENV === 'test') {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      isInitialized = true;
      console.log(`ℹ Firebase Admin SDK initialized with project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      // Clean diagnostic notice for offline / development mode without crashing
      console.info('ℹ Firebase Admin SDK: No serviceAccountKey.json found. Backend running in local offline mode without Admin SDK writes.');
    }
  }

  if (isInitialized) {
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  }
} catch (error) {
  console.warn('⚠ Firebase Admin SDK initialization deferred or inactive:', error.message);
}

export { admin, adminAuth, adminDb, isInitialized, resolveServiceAccountPath };
export default admin;
