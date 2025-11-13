import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAE7yLds8EZrEOKJaeCDdipqh3dLcb_AEc',
  authDomain: 'duarte-urbanismo.firebaseapp.com',
  projectId: 'duarte-urbanismo',
  storageBucket: 'duarte-urbanismo.firebasestorage.app',
  messagingSenderId: '229443963922',
  appId: '1:229443963922:web:ad430a6eaecf47637b5ccb',
  measurementId: 'G-TP40M3WZJ6',
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics apenas no cliente
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };

export default app;

