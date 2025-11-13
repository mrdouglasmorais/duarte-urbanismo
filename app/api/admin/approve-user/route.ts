import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, getUserProfile } from '@/lib/firebase/auth';
import { getPendingUsersFromFirestore } from '@/lib/firebase/firestore-helpers';
import type { UserStatus } from '@/lib/firebase/auth';
import { requireSuperAdmin } from '@/lib/middleware-role';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar se é SUPER_ADMIN
    const authError = await requireSuperAdmin(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'status deve ser APPROVED ou REJECTED' },
        { status: 400 }
      );
    }

    await updateUserProfile(userId, { status: status as UserStatus });
    const user = await getUserProfile(userId);

    return NextResponse.json(
      {
        success: true,
        message: `Usuário ${status === 'APPROVED' ? 'aprovado' : 'rejeitado'} com sucesso`,
        user: {
          id: user?.uid,
          email: user?.email,
          name: user?.name,
          status: user?.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao aprovar/rejeitar usuário:', error);

    if (error instanceof Error && error.message === 'Usuário não encontrado') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}

// GET para listar usuários pendentes
export async function GET(request: NextRequest) {
  try {
    const authError = await requireSuperAdmin(request);
    if (authError) {
      return authError;
    }

    const users = await getPendingUsersFromFirestore();

    return NextResponse.json(
      {
        success: true,
        users: users.map(user => ({
          id: user.uid,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar usuários pendentes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários pendentes' },
      { status: 500 }
    );
  }
}

