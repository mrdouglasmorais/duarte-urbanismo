import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile, UserStatus } from './auth';

/**
 * Busca usuários pendentes no Firestore
 */
export async function getPendingUsersFromFirestore(): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'PENDING'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: doc.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  });

  return users;
}

/**
 * Busca todos os usuários no Firestore
 */
export async function getAllUsersFromFirestore(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

  const querySnapshot = await getDocs(q);
  const users: UserProfile[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: doc.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  });

  return users;
}

