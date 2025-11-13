# 🔥 Configuração do Firebase Admin SDK

Este guia explica como configurar o Firebase Admin SDK para que os seeds e operações server-side funcionem corretamente.

## 📋 Situação Atual

O Firebase Admin SDK está configurado apenas com `projectId`, mas **não tem credenciais** configuradas. Isso funciona em produção (Vercel) com Application Default Credentials, mas **não funciona em desenvolvimento local**.

## 🎯 O que precisa ser configurado

### ✅ Opção 1: Desenvolvimento Local (Recomendado)

#### Passo 1: Baixar Service Account Key

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **duarte-urbanismo**
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Contas de serviço**
5. Clique em **Gerar nova chave privada**
6. Baixe o arquivo JSON (ex: `duarte-urbanismo-firebase-adminsdk.json`)

#### Passo 2: Configurar Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Firebase Admin SDK - Service Account
GOOGLE_APPLICATION_CREDENTIALS=/caminho/completo/para/duarte-urbanismo-firebase-adminsdk.json
```

**Exemplo no macOS/Linux:**

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/douglasmorais/Desktop/duarte-urbanismo/firebase-service-account.json
```

**Exemplo no Windows:**

```bash
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\douglasmorais\Desktop\duarte-urbanismo\firebase-service-account.json
```

#### Passo 3: Adicionar ao .gitignore

Certifique-se de que o arquivo de service account está no `.gitignore`:

```gitignore
# Firebase Service Account
firebase-service-account.json
*-firebase-adminsdk*.json
```

#### Passo 4: Reiniciar o Servidor

Após configurar a variável de ambiente, reinicie o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
yarn dev
```

### ✅ Opção 2: Produção (Vercel) - Application Default Credentials

Na Vercel, você pode usar Application Default Credentials de duas formas:

#### Método A: Variáveis de Ambiente na Vercel

1. No painel da Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Nome:** `GOOGLE_APPLICATION_CREDENTIALS`
   - **Valor:** Caminho ou conteúdo do arquivo JSON

#### Método B: Service Account via Vercel Secrets

1. No Firebase Console, gere uma service account key
2. No Vercel, vá em **Settings** → **Secrets**
3. Adicione o conteúdo do JSON como secret
4. Configure para usar em produção

**Nota:** Em muitos casos, a Vercel já detecta automaticamente as credenciais do Firebase quando o projeto está conectado.

## 🔍 Verificar se está funcionando

Após configurar, teste executando o seed:

```bash
curl -X POST http://localhost:3000/api/seed/all
```

Se funcionar, você verá:

```json
{
  "success": true,
  "summary": {
    "firebase": {
      "usuariosCriados": 4,
      "usuariosAtualizados": 0,
      "errors": 0
    }
  }
}
```

## 📝 Estrutura do Arquivo de Service Account

O arquivo JSON baixado do Firebase tem esta estrutura:

```json
{
  "type": "service_account",
  "project_id": "duarte-urbanismo",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@duarte-urbanismo.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## ⚠️ Segurança

1. **NUNCA** commite o arquivo de service account no Git
2. **SEMPRE** adicione ao `.gitignore`
3. Use variáveis de ambiente em produção
4. Rotacione as chaves periodicamente

## 🐛 Troubleshooting

### Erro: "Could not load the default credentials"

**Solução:** Configure `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo JSON.

### Erro: "Permission denied"

**Solução:** Verifique se a service account tem as permissões corretas no Firebase Console:

- **Authentication Admin**
- **Cloud Firestore Admin**

### Erro: "Project ID not found"

**Solução:** Verifique se o `projectId` no código corresponde ao projeto no Firebase Console.

## 📚 Referências

- [Firebase Admin SDK - Node.js](https://firebase.google.com/docs/admin/setup)
- [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
