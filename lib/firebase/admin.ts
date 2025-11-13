// Este arquivo só deve ser importado no servidor
// Usar importação dinâmica para evitar que webpack tente processar firebase-admin
import './server-only';

let adminAuth: any;
let adminDb: any;

// Função para inicializar Firebase Admin apenas quando necessário
async function initializeAdmin() {
  if (typeof window !== 'undefined') {
    return; // Não executar no cliente
  }

  try {
    const { initializeApp, getApps } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    let app;
    if (getApps().length === 0) {
      app = initializeApp({
        projectId: 'duarte-urbanismo',
      });
    } else {
      app = getApps()[0];
    }

    if (app) {
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase Admin não pôde ser inicializado:', error);
  }
}

// Inicializar apenas no servidor
if (typeof window === 'undefined') {
  // Inicializar de forma assíncrona para evitar problemas de build
  initializeAdmin().catch((error) => {
    console.warn('Erro ao inicializar Firebase Admin:', error);
  });
}

export { adminAuth, adminDb };

