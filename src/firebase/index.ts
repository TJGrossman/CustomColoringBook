'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This object holds the initialized Firebase services.
let firebaseServices: { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore; } | null = null;

// This function ensures Firebase is initialized only once.
export function initializeFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }

  let app: FirebaseApp;
  if (!getApps().length) {
    try {
      // For Firebase App Hosting, environment variables are automatically provided.
      app = initializeApp();
    } catch (e) {
      // Fallback for local development or other environments.
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseServices = { firebaseApp: app, auth, firestore };
  
  return firebaseServices;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
