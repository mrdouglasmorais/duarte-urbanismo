import { cookies } from 'next/headers';
import { findUserById } from '@/lib/auth';
import { UserRole } from '@/models/User';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function requireAuth(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('sgci-auth')?.value;

    if (!userId) {
      return {
        error: NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        ),
        session: null,
      };
    }

    const user = await findUserById(userId);
    if (!user || user.status !== 'APPROVED') {
      return {
        error: NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        ),
        session: null,
      };
    }

    return { error: null, session: { user } };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Erro ao verificar autenticação' },
        { status: 500 }
      ),
      session: null,
    };
  }
}

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const { error, session } = await requireAuth(request);

  if (error) {
    return { error, session: null };
  }

  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { error: 'Acesso negado. Permissões insuficientes.' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requireSuperAdmin(request: NextRequest) {
  return requireRole(request, ['SUPER_ADMIN']);
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
}

