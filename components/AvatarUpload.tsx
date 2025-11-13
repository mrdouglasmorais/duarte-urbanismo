'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete?: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const { data: session, update } = useSession();
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Upload
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const data = await response.json();

      // Atualizar sessão
      await update();

      // Callback
      if (onUploadComplete) {
        onUploadComplete(data.avatarUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setPreview(currentAvatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {preview ? (
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-emerald-200 shadow-lg">
            <Image
              src={preview}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-100">
            <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="rounded-full border-2 border-emerald-300 bg-emerald-50 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Enviando...' : preview ? 'Alterar Foto' : 'Adicionar Foto'}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center max-w-xs">{error}</p>
      )}

      <p className="text-xs text-slate-500 text-center max-w-xs">
        Formatos aceitos: JPG, PNG, WEBP. Máximo 5MB.
      </p>
    </div>
  );
}

