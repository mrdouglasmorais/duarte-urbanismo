import { verifyPassword } from '@/lib/users/repository';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch (error) {
      console.error('Erro ao parsear JSON do login:', error);
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await verifyPassword(email.trim(), password);
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return NextResponse.json(
        { error: 'Erro ao processar autenticação' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    if (!user.id || !user.email || !user.nome) {
      console.error('Usuário com dados incompletos:', user);
      return NextResponse.json(
        { error: 'Erro ao obter dados do usuário' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    });

    response.cookies.set('sgci-auth', user.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível autenticar.' },
      { status: 500 }
    );
  }
}
