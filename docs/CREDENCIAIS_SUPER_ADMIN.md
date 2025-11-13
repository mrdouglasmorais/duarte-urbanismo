# 🔐 Credenciais do SUPER_ADMIN

## ✅ Primeiro SUPER_ADMIN Criado

O primeiro SUPER_ADMIN foi criado com sucesso no banco de dados.

### 📝 Credenciais de Acesso

```
Email: admin@duarteurbanismo.com
Senha: admin123456
Role: SUPER_ADMIN
Status: APPROVED
```

### 🚀 Como Usar

1. **Acesse a página de login:**
   ```
   http://localhost:3000/login
   ```

2. **Faça login com as credenciais acima**

3. **Após o login, você será redirecionado para:**
   - `/painel` - Dashboard principal
   - `/admin/pendentes` - Lista de usuários pendentes para aprovação

### ⚠️ IMPORTANTE

**Altere a senha após o primeiro login!**

Para alterar a senha, você pode:
- Criar um endpoint de alteração de senha (a implementar)
- Ou usar o script para atualizar manualmente

### 🔄 Criar Novo SUPER_ADMIN

Se precisar criar outro SUPER_ADMIN, você pode:

1. **Via Script:**
   ```bash
   node scripts/create-super-admin.js
   ```

2. **Via API (apenas se não existir SUPER_ADMIN):**
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-super-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "novo-admin@duarteurbanismo.com",
       "password": "senha123456",
       "name": "Novo Administrador"
     }'
   ```

### 📊 Fluxo Completo

```
1. Login como SUPER_ADMIN
   ↓
2. Acessar /admin/pendentes
   ↓
3. Ver lista de corretores pendentes
   ↓
4. Aprovar ou rejeitar corretores
   ↓
5. Corretor aprovado pode fazer login
```

### 🛡️ Segurança

- ✅ Senha hashada com bcrypt (12 rounds)
- ✅ JWT Session com expiração de 8 horas
- ✅ Proteção de rotas por role
- ✅ Apenas SUPER_ADMIN pode aprovar/rejeitar usuários

