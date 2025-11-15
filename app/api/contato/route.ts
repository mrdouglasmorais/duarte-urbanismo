import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

interface ContatoData {
  nome: string;
  email: string;
  telefone: string;
  mensagem?: string;
  dataAgendamento?: string;
  horarioAgendamento?: string;
  corretorId?: string;
}

/**
 * POST /api/contato
 * Salva mensagem de contato no MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body: ContatoData = await request.json();

    const { nome, email, telefone, mensagem, dataAgendamento, horarioAgendamento, corretorId } = body;

    // Validações básicas
    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contatosCollection = db.collection('sgci_contatos');

    // Salvar contato no MongoDB
    await contatosCollection.insertOne({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      mensagem: mensagem?.trim() || '',
      dataAgendamento: dataAgendamento || null,
      horarioAgendamento: horarioAgendamento || null,
      corretorId: corretorId || null,
      criadoEm: new Date().toISOString(),
      status: 'Novo',
    });

    return NextResponse.json({
      success: true,
      message: 'Mensagem recebida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao salvar contato:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

