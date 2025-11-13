import bcryptjs from 'bcryptjs';
import { getUserModel, UserRole, UserStatus } from '@/models/User';

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function findUserByEmail(email: string) {
  const User = await getUserModel();
  return User.findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(id: string) {
  const User = await getUserModel();
  return User.findById(id);
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}) {
  const User = await getUserModel();

  const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  const passwordHash = await hashPassword(data.password);

  const user = new User({
    email: data.email.toLowerCase().trim(),
    passwordHash,
    name: data.name.trim(),
    phone: data.phone?.trim(),
    role: data.role || 'CORRETOR',
    status: data.status || 'PENDING',
  });

  await user.save();

  const { passwordHash: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const User = await getUserModel();
  const user = await User.findByIdAndUpdate(
    userId,
    { status, updatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const { passwordHash: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const User = await getUserModel();
  const user = await User.findByIdAndUpdate(
    userId,
    { avatarUrl, updatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const { passwordHash: _, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

export async function getPendingUsers() {
  const User = await getUserModel();
  const users = await User.find({ status: 'PENDING' })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return users.map(user => user.toObject());
}

