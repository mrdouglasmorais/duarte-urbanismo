import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/users/repository';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('sgci-auth')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await findUserById(userId);
    if (!user || !user.ativo) {
      return NextResponse.json({ user: null });
    }

    const { password: _ignoredPassword, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return NextResponse.json({ user: null });
  }
}

