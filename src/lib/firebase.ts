/**
 * Firebase singleton — every site in the oriz family initializes the same
 * project (oriz-app) so a logged-in user is logged in across every subdomain.
 *
 * Imports the shared initializer from @chirag127/oriz-ui once that package is
 * installed. Until then, this falls back to a local init so the build still
 * succeeds.
 */
import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
