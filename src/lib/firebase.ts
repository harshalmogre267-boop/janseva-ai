import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if key configurations are present
const isConfigValid = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn(
      "Firebase environment keys are missing. Application will run in Demo Mode using localStorage."
    );
  }
}

export { auth, db, isConfigValid };
