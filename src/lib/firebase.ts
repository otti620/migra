import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, inMemoryPersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with browserLocalPersistence and inMemoryPersistence to prevent IndexedDB (app/idb-set) errors in sandboxed iframes
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: [browserLocalPersistence, inMemoryPersistence],
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Initialize Firestore with memory cache to prevent IndexedDB connection closing errors in iframe sandbox environments
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    { localCache: memoryLocalCache() },
    databaseId
  );
} catch (e) {
  firestoreInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = firestoreInstance;

export default app;
