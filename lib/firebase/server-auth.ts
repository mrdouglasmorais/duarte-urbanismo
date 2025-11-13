import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { UserRole, UserProfile, UserStatus } from './auth';

// Importação dinâmica para evitar problemas com webpack
let adminAuth: any;
let adminDb: any;

async function getAdminServices() {
  if (typeof window !== 'undefined') {
    return { adminAuth: null, adminDb: null };
  }

  if (!adminAuth || !adminDb) {
    try {
      const adminModule = await import('./admin');
      adminAuth = adminModule.adminAuth;
      adminDb = adminModule.adminDb;
    } catch (error) {
      console.warn('Erro ao importar Firebase Admin:', error);
    }
  }

  return { adminAuth, adminDb };
}

/**
 * Verifica token Firebase no servidor
 */
export async function verifyFirebaseToken(token: string) {
  try {
    const { adminAuth: auth } = await getAdminServices();
    if (!auth) {
      // Se admin não estiver disponível, usar verificação básica via API
      // Em produção, configure Firebase Admin com service account
      console.warn('Firebase Admin não configurado. Usando verificação básica.');
      return null;
    }
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

/**
 * Obtém usuário autenticado do cookie
 */
export async function getServerUser(request?: NextRequest): Promise<(UserProfile & { uid: string; email: string }) | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-auth-token')?.value;

    if (!token) {
      return null;
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return null;
    }

    // Buscar perfil no Firestore
    const { adminDb: db } = await getAdminServices();
    if (!db) {
      // Retornar apenas dados básicos se admin não estiver disponível
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: '',
        role: 'CORRETOR' as UserRole,
        status: 'PENDING' as UserStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: '',
        role: 'CORRETOR' as UserRole,
        status: 'PENDING' as UserStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const profile = userDoc.data();
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: profile?.name || '',
      phone: profile?.phone,
      role: (profile?.role || 'CORRETOR') as UserRole,
      status: (profile?.status || 'PENDING') as UserStatus,
      avatarUrl: profile?.avatarUrl,
      createdAt: profile?.createdAt?.toDate() || new Date(),
      updatedAt: profile?.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Erro ao obter usuário do servidor:', error);
    return null;
  }
}

/**
 * Requer autenticação
 */
export async function requireAuth(request: NextRequest) {
  const user = await getServerUser(request);

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Requer role específica
 */
export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const { error, user } = await requireAuth(request);

  if (error) {
    return { error, user: null };
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return {
      error: NextResponse.json(
        { error: 'Acesso negado. Permissões insuficientes.' },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Requer usuário aprovado
 */
export async function requireApprovedUser(request: NextRequest) {
  const { error, user } = await requireAuth(request);

  if (error) {
    return { error, user: null };
  }

  if (!user || user.status !== 'APPROVED') {
    return {
      error: NextResponse.json(
        { error: 'Conta não aprovada. Aguarde a aprovação do administrador.' },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

