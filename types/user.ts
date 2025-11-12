export interface User {
  id: string;
  nome: string;
  email: string;
  password: string; // Hash da senha
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  nome: string;
  email: string;
  password: string;
  ativo?: boolean;
}

export interface UserUpdate {
  nome?: string;
  email?: string;
  password?: string;
  ativo?: boolean;
}

