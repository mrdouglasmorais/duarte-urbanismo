# 🔄 Fluxo de Aprovação de Corretores

## 📋 Diagrama do Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                   1. CADASTRO DO CORRETOR                        │
│                                                                   │
│  Corretor acessa /cadastro-corretor                              │
│  ↓                                                                │
│  Preenche formulário completo                                    │
│  ↓                                                                │
│  POST /api/auth/register                                         │
│  { email, password, name, phone }                               │
│  ↓                                                                │
│  Cria User no MongoDB com:                                       │
│  - role: "CORRETOR"                                              │
│  - status: "PENDING"                                             │
│  ↓                                                                │
│  POST /api/corretores/cadastro                                  │
│  Salva dados adicionais (CRECI, endereço, banco, etc.)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   2. NOTIFICAÇÃO (Futuro)                        │
│                                                                   │
│  [Opcional] Enviar e-mail ao SUPER_ADMIN                        │
│  informando novo cadastro pendente                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   3. APROVAÇÃO PELO SUPER ADMIN                  │
│                                                                   │
│  SUPER_ADMIN acessa /admin/pendentes                            │
│  ↓                                                                │
│  GET /api/admin/approve-user                                    │
│  Lista todos os usuários com status: "PENDING"                  │
│  ↓                                                                │
│  SUPER_ADMIN visualiza lista de pendentes                       │
│  ↓                                                                │
│  Clica em "Aprovar" ou "Rejeitar"                               │
│  ↓                                                                │
│  POST /api/admin/approve-user                                   │
│  { userId, status: "APPROVED" | "REJECTED" }                   │
│  ↓                                                                │
│  Atualiza User.status no MongoDB                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. LOGIN DO CORRETOR                           │
│                                                                   │
│  Corretor tenta fazer login                                      │
│  ↓                                                                │
│  POST /api/auth/[...nextauth]                                    │
│  Credentials Provider valida:                                   │
│  - Email e senha                                                 │
│  - Verifica passwordHash com bcrypt                             │
│  - Verifica se status === "APPROVED"                            │
│  ↓                                                                │
│  Se status !== "APPROVED":                                      │
│  → Erro: "Sua conta ainda não foi aprovada"                     │
│  ↓                                                                │
│  Se status === "APPROVED":                                      │
│  → Cria sessão JWT com role e status                            │
│  → Redireciona para /corretor/profile                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   5. PERFIL DO CORRETOR                          │
│                                                                   │
│  Corretor acessa /corretor/profile                              │
│  ↓                                                                │
│  Middleware verifica:                                           │
│  - Autenticação (token válido)                                   │
│  - Role === "CORRETOR"                                           │
│  ↓                                                                │
│  Exibe informações do perfil                                     │
│  ↓                                                                │
│  Upload de Avatar:                                              │
│  POST /api/user/avatar                                           │
│  - Upload para Cloudinary                                        │
│  - Crop face (600x600)                                          │
│  - Atualiza User.avatarUrl                                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Proteção de Rotas

### Middleware (`middleware.ts`)
- Rotas `/admin/*` → Requer `role: "SUPER_ADMIN"`
- Rotas `/corretor/*` → Requer `role: "CORRETOR"`
- Rotas `/painel/*` → Requer autenticação (qualquer role)

### Helpers (`lib/middleware-role.ts`)
- `requireSuperAdmin()` → Apenas SUPER_ADMIN
- `requireAdmin()` → ADMIN ou SUPER_ADMIN
- `requireCorretor()` → CORRETOR, ADMIN ou SUPER_ADMIN

## 📊 Estados do Usuário

| Status     | Descrição                                    | Pode fazer login? |
|------------|----------------------------------------------|-------------------|
| PENDING    | Aguardando aprovação do SUPER_ADMIN         | ❌ Não            |
| APPROVED   | Aprovado pelo SUPER_ADMIN                    | ✅ Sim            |
| REJECTED   | Rejeitado pelo SUPER_ADMIN                   | ❌ Não            |

## 🎯 Roles do Sistema

| Role        | Descrição                          | Acesso                      |
|-------------|------------------------------------|-----------------------------|
| SUPER_ADMIN | Administrador principal            | Tudo + `/admin/*`           |
| ADMIN       | Administrador                      | `/painel/*`                 |
| CORRETOR    | Corretor parceiro                  | `/corretor/*`               |

## 🔄 Fluxo de Dados

### 1. Cadastro
```typescript
POST /api/auth/register
{
  email: "corretor@example.com",
  password: "senha123",
  name: "João Silva",
  phone: "(48) 99999-9999"
}

// Cria User:
{
  email: "corretor@example.com",
  passwordHash: "$2a$12$...",
  name: "João Silva",
  phone: "(48) 99999-9999",
  role: "CORRETOR",
  status: "PENDING"
}
```

### 2. Aprovação
```typescript
POST /api/admin/approve-user
{
  userId: "507f1f77bcf86cd799439011",
  status: "APPROVED"
}

// Atualiza User:
{
  ...user,
  status: "APPROVED",
  updatedAt: new Date()
}
```

### 3. Login
```typescript
POST /api/auth/[...nextauth]
{
  email: "corretor@example.com",
  password: "senha123"
}

// Valida:
- Email existe?
- passwordHash corresponde?
- status === "APPROVED"?

// Retorna JWT:
{
  id: "507f1f77bcf86cd799439011",
  email: "corretor@example.com",
  name: "João Silva",
  role: "CORRETOR",
  status: "APPROVED"
}
```

## 🛡️ Segurança

1. **Senhas**: Hash com bcrypt (12 rounds)
2. **Sessões**: JWT com expiração de 8 horas
3. **Validação**: Email único, senha mínima 6 caracteres
4. **Autorização**: Middleware verifica role antes de acessar rotas
5. **Upload**: Validação de tipo e tamanho de arquivo (máx 5MB)

## 📝 Próximos Passos (Opcional)

- [ ] E-mail de notificação ao SUPER_ADMIN quando novo cadastro
- [ ] E-mail de boas-vindas ao corretor quando aprovado
- [ ] Reset de senha por e-mail
- [ ] Logs de auditoria de aprovações/rejeições
- [ ] Dashboard de estatísticas de corretores

