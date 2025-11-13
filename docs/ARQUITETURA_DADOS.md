# 📊 Arquitetura de Dados - Duarte Urbanismo

## Visão Geral

O projeto utiliza **dois bancos de dados principais**:

1. **MongoDB** - Dados de negócio (SGCI)
2. **Firebase (Firestore + Auth)** - Autenticação e perfis de usuários

---

## 🗄️ MongoDB (Dados de Negócio)

### Coleções MongoDB

| Coleção | Descrição | Uso |
|---------|-----------|-----|
| `sgci_empreendimentos` | Empreendimentos e lotes | ✅ Dashboard, Landing Page |
| `sgci_clientes` | Clientes (PF/PJ) | ✅ Dashboard, Negociações |
| `sgci_negociacoes` | Negociações e contratos | ✅ Dashboard, Financeiro |
| `sgci_corretores` | Corretores cadastrados | ✅ Dashboard, Landing Page, Gamificação |
| `recibos` | Recibos gerados | ✅ Sistema de recibos |
| `clientes` | Clientes da área do cliente | ✅ Área do Cliente (CPF/Senha) |

### APIs MongoDB

- `GET /api/sgci/state` - Busca todos os dados SGCI
- `PUT /api/sgci/state` - Atualiza todos os dados SGCI
- `POST /api/sgci/seed` - Popula dados iniciais
- `GET /api/public/corretores` - Lista corretores (público)
- `POST /api/corretores/cadastro` - Cadastra novo corretor

### Contexto SGCI

- **Arquivo**: `contexts/sgci-context.tsx`
- **Fonte**: MongoDB via `/api/sgci/state`
- **Fallback**: Se MongoDB vazio, executa seed automaticamente
- **Sincronização**: Automática após cada alteração

---

## 🔥 Firebase (Autenticação e Perfis)

### Firestore Collections

| Coleção | Descrição | Uso |
|---------|-----------|-----|
| `users` | Perfis de usuários do sistema | ✅ Autenticação, Dashboard |

### Firebase Auth

- **Email/Password** - Login padrão
- **Google Sign-In** - Login com Google
- **Anonymous** - Login anônimo (opcional)

### APIs Firebase

- `GET /api/auth/session` - Sessão atual do usuário
- `POST /api/auth/set-token` - Define token no cookie
- `GET /api/auth/me` - Dados do usuário autenticado

### Contexto Firebase Auth

- **Arquivo**: `contexts/firebase-auth-context.tsx`
- **Fonte**: Firebase Auth + Firestore `users`
- **Sincronização**: Tempo real via `onAuthStateChanged`

---

## 📋 Fluxo de Dados

### Dashboard (Painel)

```
1. Usuário faz login → Firebase Auth
2. Token salvo em cookie → Firebase Admin verifica
3. Dashboard carrega → Contexto SGCI busca MongoDB
4. Dados exibidos → Todos do MongoDB
5. Alterações → Sincronizadas com MongoDB
```

### Landing Page

```
1. Página carrega → Busca corretores via `/api/public/corretores`
2. Dados exibidos → MongoDB (coleção `sgci_corretores`)
3. Formulário submetido → API de contato (não autenticado)
```

### Área do Cliente

```
1. Cliente faz login → MongoDB (coleção `clientes`)
2. JWT gerado → Cookie `cliente-auth-token`
3. Dashboard cliente → Dados do MongoDB
```

---

## ✅ Verificação de Dados

### Todos os dados vêm do MongoDB:

- ✅ **Empreendimentos** → `sgci_empreendimentos`
- ✅ **Clientes SGCI** → `sgci_clientes`
- ✅ **Negociações** → `sgci_negociacoes`
- ✅ **Corretores** → `sgci_corretores`
- ✅ **Recibos** → `recibos`
- ✅ **Clientes Auth** → `clientes`

### Todos os dados de autenticação vêm do Firebase:

- ✅ **Usuários do Sistema** → Firestore `users` + Firebase Auth
- ✅ **Perfis** → Firestore `users`
- ✅ **Tokens** → Firebase Auth

---

## 🚫 Dados Mockados Removidos

- ❌ `seedData` não é mais usado como fallback
- ❌ Corretores hardcoded removidos da landing page
- ❌ Contexto SGCI usa estado vazio se MongoDB vazio
- ✅ Seeds executados apenas quando necessário

---

## 📝 Seeds

### MongoDB Seeds

- **Arquivo**: `lib/sgci/seed-data.ts`
- **Execução**: `POST /api/sgci/seed` ou `POST /api/seed/all`
- **Quando**: Apenas quando MongoDB está vazio

### Firebase Seeds

- **Arquivo**: `lib/seeds/firebase-users-seed.ts`
- **Execução**: `POST /api/seed/all`
- **Quando**: Sempre que executado (cria/atualiza usuários)

---

## 🔍 Verificação de Integridade

Para verificar se os dados estão corretos:

1. **MongoDB**: Verificar coleções via MongoDB Compass ou API
2. **Firestore**: Verificar coleção `users` no Firebase Console
3. **Logs**: Verificar console do servidor para erros de sincronização

---

## 📌 Notas Importantes

- **Corretores**: Apenas MongoDB, não há sincronização com Firestore
- **Usuários**: Firestore + Firebase Auth (não MongoDB)
- **Clientes**: Dois tipos diferentes:
  - `sgci_clientes` (MongoDB) - Clientes de negociações
  - `clientes` (MongoDB) - Clientes da área do cliente (CPF/Senha)

