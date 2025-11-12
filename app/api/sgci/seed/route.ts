import { NextResponse } from 'next/server';
import { seedSgciDatabase } from '@/lib/sgci/repository';
import { seedRecibosDatabase } from '@/lib/recibos-repository';
import reciboSeeds from '@/lib/recibos/seed-data';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const state = await seedSgciDatabase();
    const recibos = await seedRecibosDatabase(reciboSeeds);
    return NextResponse.json({ ok: true, state, recibos });
  } catch (error) {
    console.error('Erro ao semear dados do SGCI:', error);
    return NextResponse.json({ error: 'Falha ao semear dados do SGCI.' }, { status: 500 });
  }
}
