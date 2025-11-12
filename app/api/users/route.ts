import { NextRequest, NextResponse } from 'next/server';
import { createUser, findAllUsers } from '@/lib/users/repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const users = await findAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Falha ao listar usuários.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const user = await createUser(data);
    const { password: _ignoredPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email já cadastrado') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ error: 'Falha ao criar usuário.' }, { status: 500 });
  }
}

