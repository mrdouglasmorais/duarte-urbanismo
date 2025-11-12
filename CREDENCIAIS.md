# 🔐 Credenciais de Acesso

## Login no Sistema

**URL:** `http://localhost:3001/login` (desenvolvimento)
**URL:** `https://duarte-urbanismo.vercel.app/login` (produção)

### Credenciais de Acesso

#### Usuário Administrador

- **E-mail:** `gestor@sgci.com`
- **Senha:** `123456`

#### Usuário: Gelvane da Silva

- **E-mail:** `gelvane.silva@duarteurbanismo.com`
- **Senha:** `123456`

#### Usuário: Daniel Duarte

- **E-mail:** `daniel.duarte@duarteurbanismo.com`
- **Senha:** `123456`

---

## 🗄️ MongoDB Atlas

**Cluster:** `duarteurbanismo.spqlzyp.mongodb.net`
**Database:** `duarte-urbanismo`

### Credenciais de Conexão

- **Usuário:** `douglasmorais_db_user`
- **Senha:** `uPcxoUQNHF7ZAINH`
- **URI:** `mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/?appName=DuarteUrbanismo&retryWrites=true&w=majority`

---

## 📜 Scripts Disponíveis

### Limpar Banco de Dados

```bash
node scripts/clear-database.js
```

### Popular Banco de Dados (Seed)

```bash
node scripts/seed-database.js
```

### Testar Conexão MongoDB

```bash
node scripts/test-mongo-connection.js
```

### Executar Todos os Testes

```bash
node scripts/test-all.js
```

### Criar Usuários

```bash
node scripts/create-users.js
```

---

## 🔗 Links Úteis

- **Painel:** `/painel`
- **Negociações:** `/painel/negociacoes`
- **Clientes:** `/painel/clientes`
- **Empreendimentos:** `/painel/empreendimentos`
- **Corretores:** `/painel/corretores`
- **API Seed:** `POST /api/sgci/seed`
- **API State:** `GET /api/sgci/state`
