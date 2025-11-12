import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser, deleteUser } from '@/lib/users/repository';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    const { password: _ignoredPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ error: 'Falha ao buscar usuário.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const user = await updateUser(id, data);
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    if (user instanceof Error) {
      return NextResponse.json({ error: user.message }, { status: 409 });
    }
    const { password: _ignoredPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email já cadastrado') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: 'Falha ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json({ error: 'Falha ao remover usuário.' }, { status: 500 });
  }
}

