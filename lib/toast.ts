/**
 * Helper functions para exibir toasts de forma consistente
 * Usa react-hot-toast para notificações
 */

import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: string | React.ReactElement;
}

/**
 * Exibe um toast de sucesso
 */
export const toastSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    ...(options?.icon && { icon: options.icon }),
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
  });
};

/**
 * Exibe um toast de erro
 */
export const toastError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    duration: options?.duration || 5000,
    position: options?.position || 'top-right',
    ...(options?.icon && { icon: options.icon }),
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
  });
};

/**
 * Exibe um toast de informação
 */
export const toastInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    ...(options?.icon && { icon: options.icon }),
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
  });
};

/**
 * Exibe um toast de aviso
 */
export const toastWarning = (message: string, options?: ToastOptions) => {
  return toast(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
  });
};

/**
 * Exibe um toast de loading
 */
export const toastLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    position: options?.position || 'top-right',
    style: {
      background: '#6b7280',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 500,
    },
  });
};

/**
 * Trata erros de API e exibe toast apropriado
 */
export const handleApiError = (error: unknown, defaultMessage = 'Ocorreu um erro inesperado') => {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Erro de rede
    if (error.message.includes('fetch') || error.message.includes('network')) {
      toastError('Erro de conexão. Verifique sua internet e tente novamente.');
      return;
    }

    // Erro de validação
    if (error.message.includes('validação') || error.message.includes('inválido')) {
      toastError(error.message);
      return;
    }

    // Erro genérico com mensagem
    toastError(error.message || defaultMessage);
    return;
  }

  // Erro desconhecido
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { message?: string; error?: string };
    const message = errorObj.message || errorObj.error || defaultMessage;
    toastError(message);
    return;
  }

  // Fallback
  toastError(defaultMessage);
};

/**
 * Wrapper para chamadas de API com tratamento de erro automático
 */
export const apiCall = async <T>(
  fetchPromise: Promise<Response>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showLoading?: boolean;
    loadingMessage?: string;
  }
): Promise<T | null> => {
  const { successMessage, errorMessage, showLoading = false, loadingMessage = 'Processando...' } = options || {};

  let loadingToastId: string | undefined;

  try {
    if (showLoading) {
      loadingToastId = toastLoading(loadingMessage);
    }

    const response = await fetchPromise;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }

    if (successMessage) {
      toastSuccess(successMessage);
    }

    return data as T;
  } catch (error) {
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }

    handleApiError(error, errorMessage);
    return null;
  }
};

