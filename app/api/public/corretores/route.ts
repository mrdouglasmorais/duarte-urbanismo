import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { Corretor } from '@/types/sgci';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    // API pública: retornar apenas corretores aprovados (ou sem status, para compatibilidade)
    const corretores = await db
      .collection<Corretor>('sgci_corretores')
      .find({
        $or: [
          { status: 'Aprovado' },
          { status: { $exists: false } } // Compatibilidade com corretores antigos sem status
        ]
      })
      .sort({ nome: 1 })
      .toArray();

    // Remover _id do MongoDB
    const corretoresClean = corretores.map(({ _id, ...corretor }) => corretor);

    return NextResponse.json(corretoresClean, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar corretores:', error);
    return NextResponse.json({ error: 'Falha ao buscar corretores.' }, { status: 500 });
  }
}

