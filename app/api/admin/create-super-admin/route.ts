import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Endpoint para criar o primeiro SUPER_ADMIN
 *
 * POST /api/admin/create-super-admin
 *
 * Body: {
 *   email: string (opcional, padrão: admin@duarteurbanismo.com)
 *   password: string (opcional, padrão: admin123456)
 *   name: string (opcional, padrão: Administrador Principal)
 * }
 *
 * NOTA: Este endpoint deve ser protegido ou removido após criar o primeiro admin
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se já existe SUPER_ADMIN
    const { findUserByEmail } = await import('@/lib/auth');
    const { getUserModel } = await import('@/models/User');

    const User = await getUserModel();
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN', status: 'APPROVED' });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: 'Já existe um SUPER_ADMIN aprovado no sistema',
          existingAdmin: {
            id: String(existingAdmin._id),
            email: existingAdmin.email,
            name: existingAdmin.name,
          }
        },
        { status: 400 }
      );
    }

    // Ler dados do body ou usar padrões
    let body: { email?: string; password?: string; name?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Se não tiver body, usar padrões
    }

    const email = body.email || 'admin@duarteurbanismo.com';
    const password = body.password || 'admin123456';
    const name = body.name || 'Administrador Principal';

    // Verificar se email já existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      // Atualizar usuário existente para SUPER_ADMIN
      const { hashPassword } = await import('@/lib/auth');
      const passwordHash = await hashPassword(password);

      existingUser.passwordHash = passwordHash;
      existingUser.role = 'SUPER_ADMIN';
      existingUser.status = 'APPROVED';
      existingUser.name = name;

      await existingUser.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Usuário atualizado para SUPER_ADMIN',
          user: {
            id: String(existingUser._id),
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            status: existingUser.status,
          },
          credentials: {
            email,
            password,
          }
        },
        { status: 200 }
      );
    }

    // Criar novo SUPER_ADMIN
    const user = await createUser({
      email,
      password,
      name,
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SUPER_ADMIN criado com sucesso',
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
        credentials: {
          email,
          password,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar SUPER_ADMIN:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao criar SUPER_ADMIN',
      },
      { status: 500 }
    );
  }
}

