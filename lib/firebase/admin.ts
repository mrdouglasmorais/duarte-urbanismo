import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

if (getApps().length === 0) {
  try {
    // Tentar inicializar Firebase Admin
    // Nota: Para produção, você precisará configurar as credenciais de service account
    // Por enquanto, vamos usar inicialização sem credenciais (funciona para algumas operações)
    app = initializeApp({
      projectId: 'duarte-urbanismo',
    });
  } catch (error) {
    console.warn('Firebase Admin não pôde ser inicializado:', error);
  }
} else {
  app = getApps()[0];
}

if (app) {
  try {
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
  } catch (error) {
    console.warn('Erro ao inicializar serviços do Firebase Admin:', error);
  }
}

export { adminAuth, adminDb };

