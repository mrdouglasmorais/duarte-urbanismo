# 📋 Resumo: Configurações Firebase Necessárias

## 🎯 O que você precisa fazer

### Para Desenvolvimento Local (OBRIGATÓRIO)

1. **Baixar Service Account Key do Firebase**
   - Link direto: https://console.firebase.google.com/project/duarte-urbanismo/settings/serviceaccounts/adminsdk
   - Clique em "Gerar nova chave privada"
   - Baixe o arquivo JSON

2. **Configurar Variável de Ambiente**
   - Crie `.env.local` na raiz do projeto
   - Adicione: `GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json`
   - Coloque o arquivo JSON na raiz do projeto

3. **Reiniciar o Servidor**
   ```bash
   # Parar servidor (Ctrl+C)
   yarn dev
   ```

### Para Produção (Vercel) - OPCIONAL

A Vercel geralmente detecta automaticamente as credenciais do Firebase quando o projeto está conectado. Se não funcionar:

1. Vá em **Settings** → **Environment Variables**
2. Adicione `GOOGLE_APPLICATION_CREDENTIALS` com o caminho ou conteúdo do JSON

## ✅ Checklist Rápido

- [ ] Service account key baixado do Firebase Console
- [ ] Arquivo JSON colocado na raiz do projeto (renomeado para `firebase-service-account.json`)
- [ ] Arquivo `.env.local` criado com `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Servidor reiniciado
- [ ] Seed testado: `curl -X POST http://localhost:3000/api/seed/all`

## 🔍 Como Verificar se Funcionou

Execute o seed e verifique a resposta:

```bash
curl -X POST http://localhost:3000/api/seed/all
```

**Se funcionar, você verá:**
```json
{
  "firebase": {
    "usuariosCriados": 4,
    "usuariosAtualizados": 0,
    "errors": 0
  }
}
```

**Se não funcionar, você verá:**
```json
{
  "firebase": {
    "usuariosCriados": 0,
    "usuariosAtualizados": 0,
    "errors": 4
  }
}
```

## 📚 Documentação Completa

- **Guia Completo:** `docs/CONFIGURACAO_FIREBASE.md`
- **Quick Start:** `docs/QUICK_START_FIREBASE.md`

## ⚠️ Importante

- O arquivo `firebase-service-account.json` **NÃO será commitado** (já está no `.gitignore`)
- **NUNCA** compartilhe o arquivo de service account
- Em produção, use variáveis de ambiente ou secrets da Vercel

