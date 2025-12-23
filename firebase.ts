
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

/**
 * Robust environment variable extraction.
 * Handles cases where 'process' might be undefined or variables are missing prefixes.
 */
const getEnv = (key: string): string => {
  const env = (typeof process !== 'undefined' ? process.env : {}) as any;
  return env[`VITE_${key}`] || env[key] || "";
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('FIREBASE_DATABASE_URL'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Database | undefined;

// Validate essential configuration before initialization
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getDatabase(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.error(
    "Firebase configuration is incomplete. " +
    "Please ensure FIREBASE_API_KEY and FIREBASE_PROJECT_ID are set in your environment variables. " +
    "Missing keys: ", 
    Object.entries(firebaseConfig).filter(([_, v]) => !v).map(([k]) => k)
  );
}

// Export as non-undefined to match usage, but initializeApp error handling above prevents total crash
export const auth = authInstance as Auth;
export const db = dbInstance as Database;
export { app };
