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
    const { initializeApp, getApps, cert, applicationDefault } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');
    const { getFirestore } = await import('firebase-admin/firestore');

    let app;
    if (getApps().length === 0) {
      // Tentar usar Application Default Credentials (funciona em produção/Vercel)
      // Ou usar GOOGLE_APPLICATION_CREDENTIALS (desenvolvimento local)
      try {
        // Se GOOGLE_APPLICATION_CREDENTIALS estiver configurado, usa automaticamente
        app = initializeApp({
          credential: applicationDefault(),
          projectId: 'duarte-urbanismo',
        });
        console.log('✅ Firebase Admin inicializado com Application Default Credentials');
      } catch (adcError: any) {
        // Se Application Default Credentials falhar, tentar com arquivo local
        const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (credsPath) {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const serviceAccountPath = path.resolve(process.cwd(), credsPath.replace(/^\.\//, ''));

            if (fs.existsSync(serviceAccountPath)) {
              const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
              app = initializeApp({
                credential: cert(serviceAccount),
                projectId: 'duarte-urbanismo',
              });
              console.log('✅ Firebase Admin inicializado com Service Account do arquivo:', serviceAccountPath);
            } else {
              throw new Error(`Arquivo de service account não encontrado: ${serviceAccountPath}`);
            }
          } catch (fileError: any) {
            console.warn('Erro ao carregar service account do arquivo:', fileError.message);
            // Última tentativa: apenas com projectId (pode funcionar em alguns ambientes)
            app = initializeApp({
              projectId: 'duarte-urbanismo',
            });
            console.warn('⚠️ Firebase Admin inicializado sem credenciais explícitas (pode não funcionar)');
          }
        } else {
          // Se não tiver GOOGLE_APPLICATION_CREDENTIALS, tentar apenas com projectId
          app = initializeApp({
            projectId: 'duarte-urbanismo',
          });
          console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS não configurado, tentando sem credenciais explícitas');
        }
      }
    } else {
      app = getApps()[0];
    }

    if (app) {
      adminAuth = getAuth(app);
      adminDb = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase Admin não pôde ser inicializado:', error);
    console.warn('Para desenvolvimento local, configure GOOGLE_APPLICATION_CREDENTIALS');
    console.warn('Para produção (Vercel), use Application Default Credentials');
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

