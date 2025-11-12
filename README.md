# 🏗️ S.G.C.I — Sistema de Gestão de Contratos Imobiliários

Aplicação web em Next.js para administrar empreendimentos, clientes, negociações e o controle financeiro de contratos imobiliários. O foco está em usabilidade, segurança (rotas privadas) e rastreabilidade completa das decisões comerciais.

## ✨ Principais recursos

- 🔐 Autenticação por e-mail/senha com proteção de rotas (middleware + cookies httpOnly).
- 🏡 Dashboard com o empreendimento destaque **Pôr do Sol Eco Village** e painel de indicadores em tempo real.
- 📁 CRUD completo de empreendimentos/unidades (metragem, valor base, status Comercial).
- 👥 CRUD completo de clientes (PF/PJ) com validação de CPF/CNPJ, e-mail e telefone.
- 📝 Registro de negociações ligando cliente ↔ unidade, com descrição contratual e detalhamento de permutas.
- 💰 Controle financeiro das parcelas: criação, status (Paga/Pendente), indicadores de parcelas pagas, montante recebido e próximo vencimento.
- 🌐 Interface 100% em português, responsiva e com transições suaves entre rotas (Framer Motion).

## 🚀 Tecnologias

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** para transições
- **date-fns** para formatação

## 🔑 Acesso ao ambiente

As rotas privadas exigem autenticação. Utilize as credenciais de demonstração:

- **E-mail:** `gestor@sgci.com`
- **Senha:** `123456`

O login gera um cookie `sgci-auth` que libera o acesso ao dashboard. O logout limpa o cookie e redireciona para `/login`.

## 📦 Instalação

```bash
npm install
npm run dev
```

> Observação: se estiver offline, pode ser necessário instalar as dependências manualmente quando a rede estiver disponível.

## 📁 Estrutura relevante

```
app/
├── page.tsx                      # Landing pública do empreendimento Pôr do Sol
├── recibos/page.tsx              # Gerador público de recibos com QR Code
├── (auth)/login/page.tsx         # Página pública de login
├── (dashboard)/painel/layout.tsx # Layout privado com cabeçalho/nav
├── (dashboard)/painel/page.tsx   # Home do painel (indicadores internos)
├── (dashboard)/painel/empreendimentos/page.tsx
├── (dashboard)/painel/clientes/page.tsx
├── (dashboard)/painel/corretores/page.tsx
└── (dashboard)/painel/negociacoes/page.tsx
app/api/auth                      # Rotas de login/logout (cookies httpOnly)
app/api/recibos | gerar-pdf       # APIs públicas para validar/emitir recibos
contexts/                         # Providers de autenticação e store do SGCI
types/sgci.ts                     # Tipos de domínio (Empreendimento, Cliente, Corretor, Negociação etc.)
middleware.ts                     # Restringe apenas rotas /painel
```

## 🧱 Fluxo operacional

1. **Login** → usuário acessa `/login`, autentica-se e é redirecionado ao dashboard.
2. **Empreendimentos** → cadastrar lotes/unidades com metragem, valor e status.
3. **Clientes** → registrar PF/PJ com validação de CPF/CNPJ, contatos secundários e referências.
4. **Corretores** → cadastrar CRECI, áreas de atuação e observações da equipe comercial.
5. **Negociações** → escolher cliente + unidade, registrar termos, permutas e parcelas.
6. **Financeiro** → adicionar parcelas, marcar pagamentos e acompanhar indicadores.

Todos os dados ficam persistidos em `localStorage`, garantindo continuidade entre sessões no mesmo navegador.

## 📞 Dados corporativos

O rodapé exibe o endereço padrão:

```
Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro
São João Batista – SC · CEP 88.240-000 · Contato: +55 48 9669-6009
```

## 🤝 Contribuições

Pull requests e sugestões são bem-vindos! Priorize manter a experiência em português, a responsividade e os fluxos descritos acima.

## 🔐 QR Code e Autenticidade

- O QR Code gerado contém o número do recibo, dados essenciais, hash único e URL de verificação.
- Ao escanear, o usuário é direcionado para a API de verificação (`/api/recibos/{numero}`) que confirma a autenticidade no banco MongoDB.
- Cada hash é gerado com algoritmo SHA-256 e pode ser reforçado com um `RECIBO_HASH_SECRET`.

## 🗄️ Banco de Dados (MongoDB)

- Todas as entidades do painel (`empreendimentos`, `clientes`, `negociações`, `corretores`) são persistidas no cluster configurado em `MONGODB_URI`.
- O contexto do SGCI lê os dados via `GET /api/sgci/state` e sincroniza automaticamente cada alteração com o banco (`PUT /api/sgci/state`).
- Para popular o ambiente com dados de demonstração, basta acionar:

```bash
curl -X POST http://localhost:3000/api/sgci/seed
```

(Substitua a porta se estiver executando o projeto em outra porta.)

## 🔧 Configuração de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
MONGODB_URI=mongodb://localhost:27017/sgci
RECIBO_HASH_SECRET=your_secret_key_for_recibo_hash
```
