import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/empreendimento-destaque-dashboard
 * Retorna os dados do empreendimento em destaque para o dashboard
 */
export async function GET() {
  try {
    const db = await getDb();
    const configCollection = db.collection('sgci_empreendimentos_config');

    // Buscar empreendimento em destaque
    const config = await configCollection.findOne({ emDestaque: true });

    if (!config) {
      return NextResponse.json(
        { error: 'Nenhum empreendimento em destaque encontrado' },
        { status: 404 }
      );
    }

    // Formatar para o formato esperado pelo dashboard
    const destaque = {
      titulo: config.titulo,
      descricao: config.descricao,
      localizacao: config.localizacao,
      caracteristicas: config.caracteristicas,
      condicoes: config.investimento,
      contato: config.contato,
    };

    // Remover _id do MongoDB
    const { _id, ...configData } = config;

    return NextResponse.json({
      destaque,
      config: configData,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar empreendimento em destaque:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar dados do empreendimento' },
      { status: 500 }
    );
  }
}

