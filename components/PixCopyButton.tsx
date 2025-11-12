'use client';

import { useState } from 'react';

interface PixCopyButtonProps {
  payload: string;
  className?: string;
}

export default function PixCopyButton({ payload, className }: PixCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert(`Copie manualmente: ${payload}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
    >
      {copied ? 'PIX copiado!' : 'Copiar PIX copia e cola'}
    </button>
  );
}
