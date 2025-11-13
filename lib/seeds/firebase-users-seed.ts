import type { UserRole } from '@/lib/firebase/auth';

export interface FirebaseUserSeed {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const firebaseUsersSeedData: FirebaseUserSeed[] = [
  {
    email: 'admin@duarteurbanismo.com',
    password: 'admin123456',
    name: 'Administrador',
    phone: '+55 47 9211-2284',
    role: 'SUPER_ADMIN',
    status: 'APPROVED',
  },
  {
    email: 'gestor@duarteurbanismo.com',
    password: 'gestor123456',
    name: 'Gestor',
    phone: '+55 47 9211-2284',
    role: 'ADMIN',
    status: 'APPROVED',
  },
  {
    email: 'daniel.duarte@duarteurbanismo.com',
    password: 'daniel123456',
    name: 'Daniel Duarte',
    phone: '+55 47 9211-2284',
    role: 'ADMIN', // Administrador do sistema
    status: 'APPROVED',
  },
  {
    email: 'gelvane.silva@duarteurbanismo.com',
    password: 'gelvane123456',
    name: 'Gelvane Silva',
    phone: '+55 47 9211-2284',
    role: 'ADMIN', // Administrador do sistema
    status: 'APPROVED',
  },
];

/**
 * Seed de usuários no Firebase usando Admin SDK
 * ATENÇÃO: Este script deve ser executado apenas no servidor
 */
export async function seedFirebaseUsers(): Promise<{ created: number; updated: number; errors: number }> {
  if (typeof window !== 'undefined') {
    throw new Error('Este script só pode ser executado no servidor');
  }

  let created = 0;
  let updated = 0;
  let errors = 0;

  // Carregar variáveis de ambiente do .env.local se necessário
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const envLocalPath = path.join(process.cwd(), '.env.local');

      if (fs.existsSync(envLocalPath)) {
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const credsMatch = envContent.match(/GOOGLE_APPLICATION_CREDENTIALS=(.+)/);
        if (credsMatch) {
          const credsPath = credsMatch[1].trim();
          process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.cwd(), credsPath.replace(/^\.\//, ''));
        }
      }
    } catch (envError) {
      // Ignorar erros ao carregar .env.local
    }
  }

  // Importar Firebase Admin
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const fs = await import('fs');
  const path = await import('path');

  // Inicializar Firebase Admin
  let app;
  try {
    if (getApps().length === 0) {
      // Tentar carregar service account do arquivo se GOOGLE_APPLICATION_CREDENTIALS estiver configurado
      const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (credsPath) {
        try {
          const serviceAccountPath = path.resolve(process.cwd(), credsPath.replace(/^\.\//, ''));

          if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            app = initializeApp({
              credential: cert(serviceAccount),
              projectId: 'duarte-urbanismo',
            });
            console.log('   ✓ Firebase Admin inicializado com Service Account');
          } else {
            throw new Error(`Arquivo não encontrado: ${serviceAccountPath}`);
          }
        } catch (fileError: any) {
          console.warn('   ⚠ Erro ao carregar service account:', fileError.message);
          // Tentar apenas com projectId (pode funcionar em alguns ambientes)
          app = initializeApp({
            projectId: 'duarte-urbanismo',
          });
        }
      } else {
        // Tentar usar Application Default Credentials (produção/Vercel)
        try {
          const { applicationDefault } = await import('firebase-admin/app');
          app = initializeApp({
            credential: applicationDefault(),
            projectId: 'duarte-urbanismo',
          });
          console.log('   ✓ Firebase Admin inicializado com Application Default Credentials');
        } catch (adcError: any) {
          // Fallback: apenas projectId
          app = initializeApp({
            projectId: 'duarte-urbanismo',
          });
          console.warn('   ⚠ Firebase Admin inicializado sem credenciais explícitas');
        }
      }
    } else {
      app = getApps()[0];
    }
  } catch (initError: any) {
    console.error('   ✗ Erro ao inicializar Firebase Admin:', initError.message);
    console.error('   ⚠ Certifique-se de que as credenciais do Firebase estão configuradas');
    console.error('   ⚠ Em produção (Vercel), use Application Default Credentials');
    console.error('   ⚠ Em desenvolvimento local, configure GOOGLE_APPLICATION_CREDENTIALS no .env.local');
    throw initError;
  }

  const adminAuth = getAuth(app);
  const adminDb = getFirestore(app);

  for (const userData of firebaseUsersSeedData) {
    try {
      let userRecord;
      let isNew = false;

      try {
        // Tentar buscar usuário existente
        userRecord = await adminAuth.getUserByEmail(userData.email);
      } catch (error: any) {
        // Se não existe, criar novo
        if (error.code === 'auth/user-not-found') {
          userRecord = await adminAuth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name,
            emailVerified: true,
          });
          isNew = true;
        } else {
          throw error;
        }
      }

      // Criar ou atualizar perfil no Firestore
      const userRef = adminDb.collection('users').doc(userRecord.uid);
      const userDoc = await userRef.get();

      const profileData = {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role,
        status: userData.status || 'APPROVED',
        avatarUrl: '',
        createdAt: userDoc.exists ? userDoc.data()?.createdAt : new Date(),
        updatedAt: new Date(),
      };

      await userRef.set(profileData, { merge: true });

      if (isNew) {
        console.log(`   ✓ Usuário ${userData.email} criado`);
        created++;
      } else {
        console.log(`   ✓ Usuário ${userData.email} atualizado`);
        updated++;
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
      const errorCode = error?.code || 'UNKNOWN';
      console.error(`   ✗ Erro ao processar usuário ${userData.email}:`, errorMessage);
      console.error(`     Código: ${errorCode}`);
      if (error?.stack && process.env.NODE_ENV === 'development') {
        console.error(`     Stack: ${error.stack}`);
      }
      errors++;
    }
  }

  return { created, updated, errors };
}

