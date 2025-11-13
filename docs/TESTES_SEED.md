# 🧪 Testes e Validação dos Seeds

## ✅ Status dos Testes

### MongoDB - ✅ Funcionando Perfeitamente

Todas as collections MongoDB foram populadas com sucesso:

- ✅ **sgci_empreendimentos**: 3 empreendimentos
- ✅ **sgci_clientes**: 2 clientes SGCI
- ✅ **sgci_negociacoes**: 2 negociações
- ✅ **sgci_corretores**: 2 corretores
- ✅ **recibos**: 4 recibos
- ✅ **clientes**: 3 clientes (área do cliente)

### Firebase - ⚠️ Requer Configuração

O seed do Firebase requer credenciais de administrador configuradas:

**Em Produção (Vercel):**
- Usa Application Default Credentials automaticamente
- Funciona sem configuração adicional

**Em Desenvolvimento Local:**
- Requer variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS`
- Ou configuração manual de service account

## 🚀 Como Executar os Testes

### 1. Limpar Collections

```bash
# Via script Node.js
node scripts/clear-all-collections.js

# Via API (servidor rodando)
curl -X POST http://localhost:3000/api/seed/clear
```

### 2. Executar Seed Completo

```bash
# Via API (servidor rodando)
curl -X POST http://localhost:3000/api/seed/all

# Via script de teste
node scripts/test-seed.js
```

### 3. Verificar Dados

#### MongoDB
```bash
# Conectar ao MongoDB e verificar collections
mongosh "mongodb+srv://..."
use duarte-urbanismo
db.sgci_empreendimentos.find().pretty()
db.clientes.find().pretty()
```

#### Firebase
- Acesse Firebase Console
- Verifique a collection `users` no Firestore

## 📊 Dados de Teste Criados

### Clientes (Área do Cliente)
- CPF: `12345678909` | Senha: `123456`
- CPF: `98765432100` | Senha: `123456`
- CPF: `11122233344` | Senha: `123456`

### Usuários Firebase (se configurado)
- `admin@duarteurbanismo.com` | `admin123456` (SUPER_ADMIN)
- `gestor@duarteurbanismo.com` | `gestor123456` (ADMIN)
- `daniel.duarte@duarteurbanismo.com` | `daniel123456` (CORRETOR)
- `gelvane.silva@duarteurbanismo.com` | `gelvane123456` (CORRETOR)

## 🔧 Configuração do Firebase (Desenvolvimento Local)

Para fazer o seed do Firebase funcionar localmente:

1. Baixe a chave de service account do Firebase Console
2. Configure a variável de ambiente:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```
3. Execute o seed novamente

**Nota:** Em produção (Vercel), o Firebase Admin usa Application Default Credentials automaticamente, então não é necessário configurar nada.

## ✅ Checklist de Validação

- [x] Limpeza de collections MongoDB funcionando
- [x] Seed SGCI (empreendimentos, clientes, negociações, corretores) funcionando
- [x] Seed de recibos funcionando
- [x] Seed de clientes (área do cliente) funcionando
- [ ] Seed Firebase funcionando (requer credenciais)
- [x] API routes de seed funcionando
- [x] Scripts de teste criados

## 📝 Próximos Passos

1. **Configurar Firebase Admin** (se necessário para desenvolvimento local)
2. **Testar login** com as credenciais criadas
3. **Validar dados** no dashboard
4. **Testar funcionalidades** com os dados de seed

