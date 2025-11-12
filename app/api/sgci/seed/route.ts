import { NextResponse } from 'next/server';
import { seedSgciDatabase } from '@/lib/sgci/repository';
import { seedRecibosDatabase } from '@/lib/recibos-repository';
import reciboSeeds from '@/lib/recibos/seed-data';
import { createUser } from '@/lib/users/repository';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Criar usuário padrão se não existir
    try {
      await createUser({
        nome: 'Gestor S.G.C.I.',
        email: 'gestor@sgci.com',
        password: '123456',
        ativo: true
      });
    } catch (error) {
      // Ignora se já existe
      if (!(error instanceof Error && error.message === 'Email já cadastrado')) {
        console.error('Erro ao criar usuário padrão:', error);
      }
    }

    const state = await seedSgciDatabase();
    const recibos = await seedRecibosDatabase(reciboSeeds);
    return NextResponse.json({ ok: true, state, recibos });
  } catch (error) {
    console.error('Erro ao semear dados do SGCI:', error);
    return NextResponse.json({ error: 'Falha ao semear dados do SGCI.' }, { status: 500 });
  }
}
