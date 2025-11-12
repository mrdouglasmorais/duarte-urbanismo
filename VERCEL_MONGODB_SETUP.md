# 🔐 Configuração MongoDB Atlas para Vercel

## ⚠️ Importante: IP Whitelist no MongoDB Atlas

Para que seu projeto na Vercel (https://duarte-urbanismo.vercel.app/) se conecte ao MongoDB Atlas, você precisa configurar a lista de IPs permitidos.

---

## 📋 Opções de Configuração

### ⭐ Opção 1: Permitir Todos os IPs (Recomendado para Plano Hobby)

**Esta é a solução mais simples e funciona em qualquer plano da Vercel.**

Como as funções serverless da Vercel não têm IP fixo (exceto em planos Pro/Enterprise), a melhor opção é permitir todos os IPs:

#### Passo a Passo:

1. **Acesse o MongoDB Atlas:**
   - Vá para: https://cloud.mongodb.com/
   - Faça login na sua conta
   - Selecione o projeto/cluster: `duarteurbanismo`

2. **Vá para Network Access:**
   - No menu lateral, clique em **Security**
   - Clique em **Network Access**

3. **Adicione o IP:**
   - Clique no botão **Add IP Address** (ou **ADD IP ADDRESS**)
   - Na janela que abrir:
     - **Access List Entry:** Digite `0.0.0.0/0`
     - **Comment (opcional):** `Vercel Serverless Functions`
   - Clique em **Confirm**

4. **Aguarde:**
   - A configuração pode levar 1-2 minutos para ser aplicada
   - Você verá o IP `0.0.0.0/0` na lista com status "Active"

#### ✅ Por que isso é seguro?

- ✅ O MongoDB requer autenticação (usuário e senha)
- ✅ A conexão usa SSL/TLS criptografado
- ✅ As credenciais estão protegidas no código
- ✅ Apenas quem tem as credenciais pode acessar

---

### 🔒 Opção 2: IPs Estáticos da Vercel (Plano Pro/Enterprise)

**Esta opção é mais restritiva, mas requer plano pago da Vercel.**

Se você tiver plano Pro ou Enterprise na Vercel:

1. **Configure IPs Estáticos na Vercel:**
   - Acesse: https://vercel.com/dashboard
   - Vá em **Settings** → **Connectivity**
   - Ative **Static IPs** para sua região
   - Anote os IPs fornecidos

2. **Adicione os IPs no MongoDB Atlas:**
   - Vá em **Security** → **Network Access**
   - Clique em **Add IP Address**
   - Adicione cada IP estático fornecido pela Vercel
   - Salve

**Referência:** [Vercel Static IPs Guide](https://vercel.com/guides/how-to-allowlist-deployment-ip-address)

---

## 🔍 Verificação da Configuração

### Credenciais MongoDB (já configuradas no código)

- **URI:** `mongodb+srv://douglasmorais_db_user:uPcxoUQNHF7ZAINH@duarteurbanismo.spqlzyp.mongodb.net/`
- **Database:** `duarte-urbanismo`
- **App Name:** `DuarteUrbanismo`

### Arquivo de Configuração

O arquivo `lib/mongodb.ts` já está configurado com:
- ✅ Retry logic (3 tentativas)
- ✅ Timeouts configurados (10s conexão, 45s socket)
- ✅ Conexão global para reutilização
- ✅ Tratamento de erros robusto

---

## 🧪 Teste Após Configurar

Após adicionar o IP na whitelist:

1. **Aguarde 2-3 minutos** para a configuração ser aplicada

2. **Teste a conexão:**
   ```bash
   # Teste via API
   curl https://duarte-urbanismo.vercel.app/api/sgci/state
   ```

3. **Ou teste no navegador:**
   - Acesse: https://duarte-urbanismo.vercel.app/api/sgci/state
   - Deve retornar JSON com os dados do SGCI

4. **Teste funcionalidades:**
   - Login: https://duarte-urbanismo.vercel.app/login
   - Seed de dados: `POST /api/sgci/seed`
   - Geração de recibos

---

## 🚨 Troubleshooting

### Erro: "IP not whitelisted" ou "MongoNetworkError"

**Solução:**
1. ✅ Verifique se adicionou `0.0.0.0/0` na whitelist
2. ✅ Aguarde 2-3 minutos após adicionar
3. ✅ Verifique se o cluster está ativo no MongoDB Atlas
4. ✅ Confirme que não há outros firewalls bloqueando

### Erro: "Authentication failed"

**Solução:**
1. ✅ Verifique as credenciais em `lib/mongodb.ts`
2. ✅ Confirme que o usuário `douglasmorais_db_user` existe
3. ✅ Verifique se o usuário tem permissões de leitura/escrita

### Erro: "Connection timeout"

**Solução:**
1. ✅ Verifique se o cluster está rodando (não pausado)
2. ✅ Confirme os timeouts em `lib/mongodb.ts`
3. ✅ Verifique os logs da Vercel para mais detalhes

### Como verificar logs da Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `duarte-urbanismo`
3. Vá em **Deployments** → selecione o deployment mais recente
4. Clique em **Functions** → veja os logs de cada função

---

## 📝 Checklist de Configuração

- [ ] Acessei o MongoDB Atlas (https://cloud.mongodb.com/)
- [ ] Fui em **Security** → **Network Access**
- [ ] Adicionei `0.0.0.0/0` na whitelist
- [ ] Aguardei 2-3 minutos
- [ ] Testei a conexão na Vercel
- [ ] Verifiquei os logs da Vercel (se houver erros)
- [ ] Testei funcionalidades que usam MongoDB

---

## 🔗 Links Úteis

- **MongoDB Atlas Network Access:** https://cloud.mongodb.com/v2#/security/network/whitelist
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Static IPs:** https://vercel.com/guides/how-to-allowlist-deployment-ip-address
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/security/ip-access-list/

---

## ✅ Após Configurar com Sucesso

Quando a conexão estiver funcionando:

1. **Execute o seed de dados:**
   ```bash
   curl -X POST https://duarte-urbanismo.vercel.app/api/sgci/seed
   ```

2. **Crie um usuário:**
   ```bash
   curl -X POST https://duarte-urbanismo.vercel.app/api/users/seed
   ```

3. **Teste o login:**
   - Acesse: https://duarte-urbanismo.vercel.app/login
   - Use: `gestor@sgci.com` / `123456`

4. **Verifique se os dados estão sendo salvos:**
   - Crie um empreendimento, cliente ou negociação
   - Verifique no MongoDB Atlas se os dados aparecem

---

## 🎯 Resumo Rápido

**Para permitir conexões da Vercel:**

1. MongoDB Atlas → Security → Network Access
2. Add IP Address → `0.0.0.0/0`
3. Confirm
4. Aguardar 2-3 minutos
5. Testar!

**Pronto!** 🎉
