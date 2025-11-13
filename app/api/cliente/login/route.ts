import { connectMongo } from '@/lib/mongoose';
import Cliente from '@/models/Cliente';
import { validarCPF } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const { cpf, senha } = await request.json();

    // Validações
    if (!cpf || !senha) {
      return NextResponse.json(
        { error: 'CPF e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Buscar cliente
    const cliente = await Cliente.findOne({ cpf: cpfLimpo, ativo: true });

    if (!cliente) {
      return NextResponse.json(
        { error: 'CPF ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const senhaValida = await cliente.comparePassword(senha);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'CPF ou senha incorretos' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = sign(
      {
        clienteId: cliente._id.toString(),
        cpf: cliente.cpf,
        nome: cliente.nome,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Criar resposta
    const response = NextResponse.json(
      {
        success: true,
        cliente: {
          id: cliente._id.toString(),
          cpf: cliente.cpf,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          numeroContrato: cliente.numeroContrato,
        },
        token,
      },
      { status: 200 }
    );

    // Definir cookie HTTP-only
    response.cookies.set('cliente-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no login do cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

