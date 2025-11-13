import { NextRequest, NextResponse } from 'next/server';
import { requireRole as requireRoleFirebase } from '@/lib/firebase/server-auth';
import type { UserRole } from '@/lib/firebase/auth';

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
  const { error } = await requireRoleFirebase(request, allowedRoles);
  return error;
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

