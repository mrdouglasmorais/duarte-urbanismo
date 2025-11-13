# Guia de Uso - Sistema de Toasts

Este projeto utiliza `react-hot-toast` para exibir notificações ao usuário de forma consistente.

## Importação

```typescript
import { toastSuccess, toastError, toastWarning, toastInfo, toastLoading, handleApiError, apiCall } from '@/lib/toast';
```

## Funções Disponíveis

### `toastSuccess(message, options?)`
Exibe uma notificação de sucesso (verde).

```typescript
toastSuccess('Operação realizada com sucesso!');
```

### `toastError(message, options?)`
Exibe uma notificação de erro (vermelho).

```typescript
toastError('Erro ao processar solicitação.');
```

### `toastWarning(message, options?)`
Exibe uma notificação de aviso (laranja).

```typescript
toastWarning('Atenção: Verifique os dados informados.');
```

### `toastInfo(message, options?)`
Exibe uma notificação informativa (azul).

```typescript
toastInfo('Processando sua solicitação...');
```

### `toastLoading(message, options?)`
Exibe uma notificação de carregamento (cinza). Retorna um ID que pode ser usado para atualizar/dismiss.

```typescript
const loadingId = toastLoading('Salvando dados...');
// ... fazer operação
toast.dismiss(loadingId);
toastSuccess('Dados salvos!');
```

### `handleApiError(error, defaultMessage?)`
Trata erros de API automaticamente e exibe toast apropriado.

```typescript
try {
  await fetch('/api/endpoint');
} catch (error) {
  handleApiError(error, 'Erro ao carregar dados');
}
```

### `apiCall<T>(fetchPromise, options?)`
Wrapper para chamadas de API com tratamento automático de erros e loading.

```typescript
const data = await apiCall<MyDataType>(
  fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(formData) }),
  {
    successMessage: 'Dados salvos com sucesso!',
    errorMessage: 'Erro ao salvar dados',
    showLoading: true,
    loadingMessage: 'Salvando...'
  }
);

if (data) {
  // Dados retornados com sucesso
}
```

## Opções Disponíveis

Todas as funções de toast aceitam um objeto `options` opcional:

```typescript
interface ToastOptions {
  duration?: number;        // Duração em ms (padrão: 4000)
  position?: 'top-left' | 'top-center' | 'top-right' |
            'bottom-left' | 'bottom-center' | 'bottom-right'; // Posição (padrão: 'top-right')
  icon?: React.ReactNode;  // Ícone customizado
}
```

## Exemplos de Uso

### Formulário com Validação

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.email) {
    toastWarning('Por favor, preencha o e-mail.');
    return;
  }

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar formulário');
    }

    toastSuccess('Formulário enviado com sucesso!');
  } catch (error) {
    handleApiError(error, 'Erro ao enviar formulário');
  }
};
```

### Upload de Arquivo

```typescript
const handleFileUpload = async (file: File) => {
  const loadingId = toastLoading('Enviando arquivo...');

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload');
    }

    toast.dismiss(loadingId);
    toastSuccess('Arquivo enviado com sucesso!');
  } catch (error) {
    toast.dismiss(loadingId);
    handleApiError(error, 'Erro ao fazer upload do arquivo');
  }
};
```

### Operação Assíncrona com Feedback

```typescript
const deleteItem = async (id: string) => {
  const loadingId = toastLoading('Excluindo item...');

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir item');
    }

    toast.dismiss(loadingId);
    toastSuccess('Item excluído com sucesso!');

    // Atualizar lista
    refreshItems();
  } catch (error) {
    toast.dismiss(loadingId);
    handleApiError(error, 'Erro ao excluir item');
  }
};
```

## Integração no Projeto

O `ToastProvider` já está configurado em `components/providers.tsx` e disponível globalmente em toda a aplicação.

Não é necessário configurar nada adicional - apenas importe e use as funções onde necessário!

