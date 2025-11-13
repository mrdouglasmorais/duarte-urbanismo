# 👥 Seeds: Daniel Duarte e Gelvane Silva

## ✅ Configuração Correta

Daniel Duarte e Gelvane Silva são **administradores do sistema** e **também corretores**.

---

## 🔥 Firebase (Autenticação e Perfis)

### Firestore Collection: `users`

**Daniel Duarte:**
- Email: `daniel.duarte@duarteurbanismo.com`
- Senha: `daniel123456`
- Role: `ADMIN` ✅ (Administrador do sistema)
- Status: `APPROVED`
- Telefone: `+55 47 9211-2284`

**Gelvane Silva:**
- Email: `gelvane.silva@duarteurbanismo.com`
- Senha: `gelvane123456`
- Role: `ADMIN` ✅ (Administrador do sistema)
- Status: `APPROVED`
- Telefone: `+55 47 9211-2284`

**Arquivo**: `lib/seeds/firebase-users-seed.ts`

---

## 🗄️ MongoDB (Dados de Negócio)

### Collection: `sgci_corretores`

**Daniel Duarte:**
- ID: `cor-daniel-duarte`
- Nome: `Daniel Duarte`
- CRECI: `CRECI-SC 59847` ✅
- Email: `daniel.duarte@duarteurbanismo.com`
- Telefone: `47 9211-2284`
- WhatsApp: `554792112284`
- Área de Atuação: `Direção e Gestão`
- Foto: `/corretores/daniel-duarte.JPG`
- Status: `Aprovado`

**Gelvane Silva:**
- ID: `cor-gelvane-silva`
- Nome: `Gelvane Silva`
- CRECI: `CRECI-SC 59847` ✅
- Email: `gelvane.silva@duarteurbanismo.com`
- Telefone: `47 9211-2284`
- WhatsApp: `554792112284`
- Área de Atuação: `Vendas e Negociações`
- Foto: `/corretores/gelvane-silva.JPG`
- Status: `Aprovado`

**Arquivo**: `lib/sgci/seed-data.ts`

---

## ✅ Verificação

### Firebase (Sistema de Autenticação)
- ✅ Daniel Duarte: `ADMIN` (pode acessar todas as funcionalidades)
- ✅ Gelvane Silva: `ADMIN` (pode acessar todas as funcionalidades)

### MongoDB (Dados de Negócio)
- ✅ Daniel Duarte: Corretor cadastrado (aparece no ranking, pode ter vendas)
- ✅ Gelvane Silva: Corretor cadastrado (aparece no ranking, pode ter vendas)

---

## 🎯 Resultado

**Ambos têm acesso administrativo ao sistema (Firebase) E aparecem como corretores (MongoDB):**

- 🔐 **Firebase**: Role `ADMIN` → Acesso completo ao dashboard
- 📊 **MongoDB**: Corretor → Aparece no ranking de vendas, pode ter negociações associadas
- 🏆 **Gamificação**: Aparecem no ranking de corretores se tiverem vendas

---

## 📝 Nota sobre CRECI

Ambos compartilham o mesmo CRECI: `CRECI-SC 59847`

Se Daniel Duarte tiver um CRECI diferente, atualize em `lib/sgci/seed-data.ts`.

