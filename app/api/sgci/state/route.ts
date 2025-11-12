import { NextRequest, NextResponse } from 'next/server';
import { fetchSgciState, replaceSgciState } from '@/lib/sgci/repository';
import type { SgciState, Negociacao } from '@/types/sgci';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await fetchSgciState();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Erro ao consultar SGCI no MongoDB:', error);
    return NextResponse.json({ error: 'Falha ao consultar dados do SGCI.' }, { status: 500 });
  }
}

function sanitizeState(payload: unknown): SgciState {
  const base = (typeof payload === 'object' && payload !== null) ? (payload as Record<string, unknown>) : {};

  const empreendimentos = Array.isArray(base.empreendimentos) ? base.empreendimentos : [];
  const clientes = Array.isArray(base.clientes) ? base.clientes : [];
  const corretores = Array.isArray(base.corretores) ? base.corretores : [];
  const negociacoes = Array.isArray(base.negociacoes) ? base.negociacoes : [];

  return {
    empreendimentos: JSON.parse(JSON.stringify(empreendimentos)),
    clientes: JSON.parse(JSON.stringify(clientes)),
    corretores: JSON.parse(JSON.stringify(corretores)),
    negociacoes: JSON.parse(JSON.stringify(negociacoes)).map((negociacao: Negociacao) => ({
      ...negociacao,
      parcelas: Array.isArray(negociacao.parcelas) ? negociacao.parcelas : []
    }))
  } as SgciState;
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const sanitized = sanitizeState(payload);
    await replaceSgciState(sanitized);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar SGCI no MongoDB:', error);
    return NextResponse.json({ error: 'Falha ao atualizar dados do SGCI.' }, { status: 500 });
  }
}
