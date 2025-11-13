import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextRequest } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/lib/auth';
import { UserRole, UserStatus } from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials: Partial<Record<'email' | 'password', unknown>> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        const user = await findUserByEmail(email);

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          throw new Error('Credenciais inválidas');
        }

        // Bloquear login se status !== 'APPROVED'
        if (user.status !== 'APPROVED') {
          throw new Error('Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.');
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 60 * 60 * 8, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: 'DUARTE_URBANISMO_SECRET_KEY_2024_VERCEL_PRODUCTION_SAFE',
};

const handler = NextAuth(authOptions);

// Exportar handlers para NextAuth v5 com wrappers compatíveis com Next.js 16
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // @ts-expect-error - NextAuth v5 beta types incompatíveis com Next.js 16
  return handler(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // @ts-expect-error - NextAuth v5 beta types incompatíveis com Next.js 16
  return handler(request, context);
}

