import { ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload de imagem para Firebase Storage
 */
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);

  // Upload do arquivo
  const snapshot = await uploadBytes(storageRef, file);

  // Obter URL de download
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}

/**
 * Upload de documento para Firebase Storage
 */
export async function uploadDocument(
  file: File,
  path: string
): Promise<string> {
  return uploadImage(file, path);
}

/**
 * Deletar arquivo do Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Upload de avatar do usuário
 */
export async function uploadUserAvatar(uid: string, file: File): Promise<string> {
  const path = `avatars/${uid}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}

/**
 * Upload de foto de corretor
 */
export async function uploadCorretorPhoto(corretorId: string, file: File): Promise<string> {
  const path = `corretores/${corretorId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}

/**
 * Upload de documento de negociação
 */
export async function uploadNegociacaoDocument(negociacaoId: string, file: File): Promise<string> {
  const path = `negociacoes/${negociacaoId}/documentos/${Date.now()}_${file.name}`;
  return uploadDocument(file, path);
}

