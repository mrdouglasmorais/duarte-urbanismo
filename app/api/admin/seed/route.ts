import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/firebase/server-auth';
import { seedFirebaseUsers } from '@/lib/seeds/firebase-users-seed';
import { seedEmpreendimentos } from '@/lib/seeds/empreendimentos-seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/seed
 * Executa todos os seeds do projeto (apenas para administradores)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const user = await getServerUser(request);

    if (!user || !user.uid) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem executar seeds.' },
        { status: 403 }
      );
    }

    const results = {
      firebase: { created: 0, updated: 0, errors: 0 },
      empreendimentos: { unidades: 0, config: false },
    };

    // Executar seed de usuários Firebase
    try {
      results.firebase = await seedFirebaseUsers();
    } catch (error) {
      console.error('Erro ao executar seed de usuários Firebase:', error);
      results.firebase.errors = 1;
    }

    // Executar seed de empreendimentos
    try {
      results.empreendimentos = await seedEmpreendimentos();
    } catch (error) {
      console.error('Erro ao executar seed de empreendimentos:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Seeds executados com sucesso',
      results,
    });
  } catch (error) {
    console.error('Erro ao executar seeds:', error);
    return NextResponse.json(
      { error: 'Erro ao executar seeds' },
      { status: 500 }
    );
  }
}

