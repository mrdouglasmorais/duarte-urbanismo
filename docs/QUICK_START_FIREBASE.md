# 🚀 Quick Start - Configuração Firebase

## ⚡ Configuração Rápida (5 minutos)

### 1. Baixar Service Account Key

1. Acesse: https://console.firebase.google.com/project/duarte-urbanismo/settings/serviceaccounts/adminsdk
2. Clique em **Gerar nova chave privada**
3. Baixe o arquivo JSON
4. Renomeie para `firebase-service-account.json`
5. Coloque na raiz do projeto

### 2. Configurar Variável de Ambiente

Crie `.env.local` na raiz:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

### 3. Testar

```bash
# Reiniciar servidor
yarn dev

# Em outro terminal, testar seed
curl -X POST http://localhost:3000/api/seed/all
```

### ✅ Pronto!

Se você ver `"usuariosCriados": 4` na resposta, está funcionando!

## 🔒 Segurança

O arquivo `firebase-service-account.json` já está no `.gitignore` - não será commitado.

## 📋 Checklist

- [ ] Service account key baixado
- [ ] Arquivo renomeado para `firebase-service-account.json`
- [ ] Arquivo colocado na raiz do projeto
- [ ] `.env.local` criado com `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Servidor reiniciado
- [ ] Seed testado e funcionando

