import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CORRETOR';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cria um perfil de usuário no Firestore
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
  }
): Promise<UserProfile> {
  const userProfile: UserProfile = {
    uid,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role || 'CORRETOR',
    status: data.status || 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', uid), {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userProfile;
}

/**
 * Busca perfil do usuário no Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    uid: data.uid,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
    status: data.status,
    avatarUrl: data.avatarUrl,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Atualiza perfil do usuário no Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Login com email e senha
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Registro com email e senha
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Criar perfil no Firestore
  await createUserProfile(userCredential.user.uid, {
    email,
    name,
    phone,
    role: 'CORRETOR',
    status: 'PENDING',
  });

  return userCredential;
}

/**
 * Login com Google
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  // Verificar se perfil já existe, se não criar
  const existingProfile = await getUserProfile(userCredential.user.uid);
  if (!existingProfile) {
    await createUserProfile(userCredential.user.uid, {
      email: userCredential.user.email || '',
      name: userCredential.user.displayName || 'Usuário',
      role: 'CORRETOR',
      status: 'PENDING',
    });
  }

  return userCredential;
}

/**
 * Login anônimo
 */
export async function signInAnonymouslyAuth(): Promise<UserCredential> {
  const userCredential = await signInAnonymously(auth);

  // Criar perfil temporário no Firestore
  await createUserProfile(userCredential.user.uid, {
    email: `anonymous-${userCredential.user.uid}@temp.com`,
    name: 'Usuário Anônimo',
    role: 'CORRETOR',
    status: 'PENDING',
  });

  return userCredential;
}

/**
 * Logout
 */
export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Observa mudanças no estado de autenticação
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Verifica se usuário está autenticado e aprovado
 */
export async function isUserApproved(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.status === 'APPROVED' || false;
}

