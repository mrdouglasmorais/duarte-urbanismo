# 🌱 Documentação de Seeds

Este documento descreve como usar os scripts de seed para popular o banco de dados MongoDB e Firebase.

## 📋 Estrutura de Collections

### MongoDB Collections

1. **`sgci_empreendimentos`** - Empreendimentos e lotes
2. **`sgci_clientes`** - Clientes do sistema SGCI
3. **`sgci_negociacoes`** - Negociações e contratos
4. **`sgci_corretores`** - Corretores do sistema
5. **`recibos`** - Recibos de pagamento gerados
6. **`clientes`** - Clientes da área do cliente (autenticação CPF/senha)

### Firebase Collections

1. **`users`** - Perfis de usuários (autenticação Firebase)

## 🚀 Como Usar

### Opção 1: Via API Routes (Recomendado)

#### Limpar todas as collections

```bash
curl -X POST http://localhost:3000/api/seed/clear
```

#### Executar seed completo

```bash
curl -X POST http://localhost:3000/api/seed/all
```

### Opção 2: Via Scripts Node.js

#### Limpar collections MongoDB

```bash
node scripts/clear-all-collections.js
```

#### Testar seed completo (requer servidor rodando)

```bash
node scripts/test-seed.js
```

## 📊 Dados de Seed

### MongoDB - Clientes (Área do Cliente)

- **CPF:** `12345678909` | **Senha:** `123456` | **Nome:** João Silva
- **CPF:** `98765432100` | **Senha:** `123456` | **Nome:** Maria Santos
- **CPF:** `11122233344` | **Senha:** `123456` | **Nome:** Pedro Oliveira

### Firebase - Usuários

- **Email:** `admin@duarteurbanismo.com` | **Senha:** `admin123456` | **Role:** SUPER_ADMIN
- **Email:** `gestor@duarteurbanismo.com` | **Senha:** `gestor123456` | **Role:** ADMIN
- **Email:** `daniel.duarte@duarteurbanismo.com` | **Senha:** `daniel123456` | **Role:** CORRETOR
- **Email:** `gelvane.silva@duarteurbanismo.com` | **Senha:** `gelvane123456` | **Role:** CORRETOR

### SGCI - Dados de Demonstração

- **Empreendimentos:** 3 (Pôr do Sol Eco Village e Skyline Residence)
- **Clientes SGCI:** 2 (Lívia Martinez e Aurora Holdings)
- **Negociações:** 2 (com parcelas e recibos)
- **Corretores:** 2 (Marcos Azevedo e Juliana Santos)
- **Recibos:** 4 (vinculados às negociações)

## 🔧 Estrutura dos Seeds

### `lib/seeds/clientes-seed.ts`

Seed para a collection `clientes` (MongoDB) - área do cliente com autenticação CPF/senha.

### `lib/seeds/firebase-users-seed.ts`

Seed para a collection `users` (Firestore) - perfis de usuários do sistema.

### `lib/sgci/seed-data.ts`

Seed para as collections SGCI (empreendimentos, clientes SGCI, negociações, corretores).

### `lib/recibos/seed-data.ts`

Seed para a collection `recibos` - recibos de pagamento.

## ⚠️ Avisos Importantes

1. **Backup:** Sempre faça backup antes de executar limpeza em produção
2. **Firebase:** O seed do Firebase requer credenciais de administrador configuradas
3. **MongoDB:** Certifique-se de que a URI do MongoDB está configurada corretamente
4. **Senhas:** As senhas nos seeds são apenas para desenvolvimento/teste

## 🧪 Testes

Execute o script de teste para validar o seed completo:

```bash
# Certifique-se de que o servidor está rodando
yarn dev

# Em outro terminal
node scripts/test-seed.js
```

## 📝 Personalização

Para adicionar novos dados de seed:

1. **Clientes:** Edite `lib/seeds/clientes-seed.ts`
2. **Firebase Users:** Edite `lib/seeds/firebase-users-seed.ts`
3. **SGCI:** Edite `lib/sgci/seed-data.ts`
4. **Recibos:** Edite `lib/recibos/seed-data.ts`

## 🔍 Verificação

Após executar o seed, você pode verificar os dados:

- **MongoDB:** Use MongoDB Compass ou mongo shell
- **Firebase:** Use Firebase Console
- **API:** Use as rotas de API para consultar dados

