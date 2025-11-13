import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, verifyPassword } from '@/lib/auth';
import { UserRole, UserStatus } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await findUserByEmail(credentials.email);

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Credenciais inválidas');
        }

        // Bloquear login se status !== 'APPROVED'
        if (user.status !== 'APPROVED') {
          throw new Error('Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.');
        }

        return {
          id: user._id.toString(),
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
    strategy: 'jwt',
    maxAge: 60 * 60 * 8, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
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

export { handler as GET, handler as POST };

// Exportar authOptions e handler para uso em outros arquivos
export { authOptions };

