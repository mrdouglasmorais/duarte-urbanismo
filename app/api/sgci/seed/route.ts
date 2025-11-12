import { NextResponse } from 'next/server';
import { seedSgciDatabase } from '@/lib/sgci/repository';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const state = await seedSgciDatabase();
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    console.error('Erro ao semear dados do SGCI:', error);
    return NextResponse.json({ error: 'Falha ao semear dados do SGCI.' }, { status: 500 });
  }
}
