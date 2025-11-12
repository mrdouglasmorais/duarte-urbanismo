import { NextResponse } from 'next/server';

const DEMO_USER = {
  email: 'gestor@sgci.com',
  password: '123456',
  nome: 'Gestor S.G.C.I.'
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        email: DEMO_USER.email,
        nome: DEMO_USER.nome
      }
    });

    response.cookies.set('sgci-auth', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Não foi possível autenticar.' }, { status: 500 });
  }
}
