import { connectMongo } from '@/lib/mongoose';
import Cliente from '@/models/Cliente';
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('cliente-token')?.value;

    if (!token) {
      return NextResponse.json({ cliente: null }, { status: 200 });
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { clienteId: string; cpf: string; nome: string };

      await connectMongo();
      const cliente = await Cliente.findById(decoded.clienteId).select('-senha');

      if (!cliente || !cliente.ativo) {
        return NextResponse.json({ cliente: null }, { status: 200 });
      }

      return NextResponse.json(
        {
          cliente: {
            id: String(cliente._id),
            cpf: cliente.cpf,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
            numeroContrato: cliente.numeroContrato,
          },
        },
        { status: 200 }
      );
    } catch (jwtError) {
      // Token inválido ou expirado
      return NextResponse.json({ cliente: null }, { status: 200 });
    }
  } catch (error) {
    console.error('Erro ao verificar sessão do cliente:', error);
    return NextResponse.json({ cliente: null }, { status: 200 });
  }
}

