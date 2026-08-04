/**
 * Firebase singleton — Firestore + Analytics only.
 * Auth is handled by Clerk (see src/components/AccountIsland.tsx).
 *
 * Lazy proxy pattern: getFirestore() is deferred until a property is
 * accessed at runtime so SSR prerender doesn't crash when env vars are absent.
 */
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { type Firestore, getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

let _app: FirebaseApp | null = null
let _db: Firestore | null = null

function getApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps()[0] ?? initializeApp(config)
  return _app
}

export const db: Firestore = new Proxy({} as Firestore, {
  get(_t, p) {
    if (!_db) _db = getFirestore(getApp())
    return Reflect.get(_db, p)
  },
}) as Firestore

export const app: FirebaseApp = new Proxy({} as FirebaseApp, {
  get(_t, p) {
    return Reflect.get(getApp(), p)
  },
}) as FirebaseApp
