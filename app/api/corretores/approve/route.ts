import { getDb } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/firebase/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTION_NAME = 'sgci_corretores';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const user = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);

    const body = await request.json();
    const { corretorId, status } = body;

    if (!corretorId || !status) {
      return NextResponse.json(
        { error: 'corretorId e status são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['Aprovado', 'Rejeitado'].includes(status)) {
      return NextResponse.json(
        { error: 'status deve ser "Aprovado" ou "Rejeitado"' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection(COLLECTION_NAME);

    // Verificar se o corretor existe
    const corretor = await collection.findOne({ id: corretorId });
    if (!corretor) {
      return NextResponse.json(
        { error: 'Corretor não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status
    await collection.updateOne(
      { id: corretorId },
      {
        $set: {
          status,
          aprovadoEm: new Date().toISOString(),
          aprovadoPor: user.uid,
          aprovadoPorNome: user.name || user.email,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Corretor ${status === 'Aprovado' ? 'aprovado' : 'rejeitado'} com sucesso`,
    });
  } catch (error: any) {
    console.error('Erro ao aprovar/rejeitar corretor:', error);

    if (error.status === 401 || error.status === 403) {
      return NextResponse.json(
        { error: error.message || 'Não autorizado' },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar aprovação' },
      { status: 500 }
    );
  }
}

