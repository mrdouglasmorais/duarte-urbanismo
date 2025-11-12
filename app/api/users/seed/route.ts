import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users/repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    // Criar usuário padrão se não existir
    const defaultUser = {
      nome: 'Gestor S.G.C.I.',
      email: 'gestor@sgci.com',
      password: '123456',
      ativo: true
    };

    try {
      await createUser(defaultUser);
      return NextResponse.json({ message: 'Usuário padrão criado com sucesso.' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email já cadastrado') {
        return NextResponse.json({ message: 'Usuário padrão já existe.' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar usuário padrão:', error);
    return NextResponse.json({ error: 'Falha ao criar usuário padrão.' }, { status: 500 });
  }
}

