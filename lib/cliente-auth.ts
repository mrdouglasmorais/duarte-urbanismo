import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface ClienteSession {
  clienteId: string;
  cpf: string;
  nome: string;
}

export async function getClienteSession(): Promise<ClienteSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cliente-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as ClienteSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function requireClienteAuth(): ClienteSession {
  // Esta função será usada em server components/actions
  // Por enquanto retorna null se não autenticado
  // Pode ser expandida para lançar erro ou redirecionar
  throw new Error('Not implemented - use getClienteSession() instead');
}

