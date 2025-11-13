import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/models/User';

const NEXTAUTH_SECRET = 'DUARTE_URBANISMO_SECRET_KEY_2024_VERCEL_PRODUCTION_SAFE';

/**
 * Middleware helper para proteger rotas por role
 *
 * @param request - NextRequest object
 * @param allowedRoles - Array de roles permitidos
 * @returns NextResponse com erro ou null se autorizado
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<NextResponse | null> {
  const token = await getToken({
    req: request,
    secret: NEXTAUTH_SECRET
  });

  if (!token || !token.id) {
    return NextResponse.json(
      { error: 'Não autenticado' },
      { status: 401 }
    );
  }

  const userRole = token.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Acesso negado. Você não tem permissão para acessar este recurso.' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Requer SUPER_ADMIN
 */
export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | null> {
  return requireRole(request, ['SUPER_ADMIN']);
}

/**
 * Requer ADMIN ou SUPER_ADMIN
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  return requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
}

/**
 * Requer CORRETOR, ADMIN ou SUPER_ADMIN
 */
export async function requireCorretor(request: NextRequest): Promise<NextResponse | null> {
  return requireRole(request, ['CORRETOR', 'ADMIN', 'SUPER_ADMIN']);
}

