import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/models/User';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const { error, session } = await requireAuth(request);

  if (error) {
    return { error, session: null };
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
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

