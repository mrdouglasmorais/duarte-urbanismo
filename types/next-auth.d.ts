import { UserRole, UserStatus } from '@/models/User';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      status: UserStatus;
      avatarUrl?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    avatarUrl?: string;
  }
}

