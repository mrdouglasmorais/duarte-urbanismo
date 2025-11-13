import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/firebase/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return NextResponse.json({ user: null });
  }
}

