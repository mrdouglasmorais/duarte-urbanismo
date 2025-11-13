# 🔐 Credenciais dos SUPER_ADMINs

## ✅ 4 SUPER_ADMINs Criados

Todos os 4 SUPER_ADMINs foram criados com sucesso no banco de dados e podem aprovar/reprovar entrada de novos corretores.

### 📝 Credenciais de Acesso

#### 1. Daniel Duarte - Proprietário
```
Email: daniel.duarte@duarteurbanismo.com
Senha: Daniel2024!
Role: SUPER_ADMIN
Status: APPROVED
```

#### 2. Douglas Morais - Diretor de tecnologia e negócios
```
Email: douglas.morais@duarteurbanismo.com
Senha: Douglas2024!
Role: SUPER_ADMIN
Status: APPROVED
```

#### 3. Gelvane Silva - Corretor Chefe
```
Email: gelvane.silva@duarteurbanismo.com
Senha: Gelvane2024!
Role: SUPER_ADMIN
Status: APPROVED
```

#### 4. Stephanie Santos - Administrativo
```
Email: stephanie.santos@duarteurbanismo.com
Senha: Stephanie2024!
Role: SUPER_ADMIN
Status: APPROVED
```

### 🚀 Como Usar

1. **Acesse a página de login:**
   ```
   http://localhost:3000/login
   ```

2. **Faça login com qualquer uma das credenciais acima**

3. **Após o login, você será redirecionado para:**
   - `/painel` - Dashboard principal
   - `/admin/pendentes` - Lista de usuários pendentes para aprovação

### ⚠️ IMPORTANTE

**Altere as senhas após o primeiro login!**

Para alterar a senha, você pode:
- Criar um endpoint de alteração de senha (a implementar)
- Ou usar o script para atualizar manualmente

### 🔄 Recriar SUPER_ADMINs

Se precisar recriar os SUPER_ADMINs, execute:

```bash
node scripts/create-all-super-admins.js
```

O script:
- Verifica se cada usuário já existe
- Se existir, atualiza para SUPER_ADMIN com status APPROVED
- Se não existir, cria novo SUPER_ADMIN

### 📊 Permissões

Todos os 4 SUPER_ADMINs têm as mesmas permissões:
- ✅ Aprovar/reprovar corretores em `/admin/pendentes`
- ✅ Acessar todas as rotas administrativas
- ✅ Gerenciar usuários do sistema

### 🛡️ Segurança

- ✅ Senhas hashadas com bcrypt (12 rounds)
- ✅ JWT Session com expiração de 8 horas
- ✅ Proteção de rotas por role
- ✅ Apenas SUPER_ADMIN pode aprovar/rejeitar usuários
