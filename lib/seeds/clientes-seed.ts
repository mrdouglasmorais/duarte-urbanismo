import Cliente from '@/models/Cliente';
import { connectMongo } from '@/lib/mongoose';

export interface ClienteSeed {
  cpf: string;
  senha: string;
  nome: string;
  email?: string;
  telefone?: string;
  numeroContrato?: string;
  ativo?: boolean;
}

export const clientesSeedData: ClienteSeed[] = [
  {
    cpf: '12345678909',
    senha: '123456',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '48999999999',
    numeroContrato: 'CT-2024-001',
    ativo: true,
  },
  {
    cpf: '98765432100',
    senha: '123456',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '48988888888',
    numeroContrato: 'CT-2024-002',
    ativo: true,
  },
  {
    cpf: '11122233344',
    senha: '123456',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    telefone: '48977777777',
    numeroContrato: 'CT-2024-003',
    ativo: true,
  },
];

export async function seedClientes(): Promise<number> {
  await connectMongo();

  // Limpar collection
  await Cliente.deleteMany({});

  // Criar clientes
  const clientes = await Promise.all(
    clientesSeedData.map(async (clienteData) => {
      const cliente = new Cliente(clienteData);
      await cliente.save();
      return cliente;
    })
  );

  return clientes.length;
}

