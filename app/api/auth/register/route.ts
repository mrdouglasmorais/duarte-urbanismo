import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, passwordConfirmation, name, phone } = body;

    // Validações
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Validação de confirmação de senha (se fornecida)
    if (passwordConfirmation && password !== passwordConfirmation) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Criar usuário com role CORRETOR e status PENDING
    const user = await createUser({
      email,
      password,
      name,
      phone: phone || undefined,
      role: 'CORRETOR',
      status: 'PENDING',
    });

    // TODO: Enviar e-mail de notificação ao super admin
    // await sendNotificationToSuperAdmin(user);

    return NextResponse.json(
      {
        success: true,
        message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);

    if (error instanceof Error && error.message === 'Email já cadastrado') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao processar cadastro. Tente novamente.' },
      { status: 500 }
    );
  }
}

