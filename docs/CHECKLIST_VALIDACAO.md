# ✅ Checklist de Validação

## 🔐 Autenticação

### Área do Cliente (CPF/Senha)
- [ ] Acessar `/area-cliente`
- [ ] Inserir CPF: `12345678909`
- [ ] Inserir senha: `123456`
- [ ] Clicar em "Entrar"
- [ ] Verificar redirecionamento para dashboard
- [ ] Verificar toast de sucesso
- [ ] Verificar sessão persiste ao recarregar

### Login Firebase (Email/Senha)
- [ ] Acessar `/login`
- [ ] Inserir email: `admin@duarteurbanismo.com`
- [ ] Inserir senha: `admin123456`
- [ ] Clicar em "Entrar"
- [ ] Verificar redirecionamento para `/painel`
- [ ] Verificar sessão persiste

## 🏠 Páginas Principais

### Home
- [ ] Página carrega corretamente
- [ ] Vídeos aéreos reproduzindo
- [ ] Formulário de contato funcionando
- [ ] Logo Habitvs no rodapé com pulse
- [ ] Links de navegação funcionando

### Área do Cliente
- [ ] Página carrega corretamente
- [ ] Formulário de login visível
- [ ] Validação de CPF funcionando
- [ ] Toggle de senha funcionando

### Dashboard
- [ ] Acesso após login
- [ ] Dados do SGCI aparecendo
- [ ] Navegação entre seções funcionando
- [ ] Logout funcionando

## 📄 Documentos e PDFs

### Recibos
- [ ] Formulário de recibo carrega
- [ ] Geração de PDF funciona
- [ ] QR Code aparece no PDF
- [ ] Logo Habitvs aparece no PDF
- [ ] Preview mostra logo Habitvs com pulse

## 🎨 Visual e UX

### Rodapés
- [ ] Logo Habitvs aparece em todos os rodapés
- [ ] Efeito pulse está visível e suave
- [ ] Link para habitvs.io funciona
- [ ] Versão light/dark correta conforme tema

### Toasts
- [ ] Toasts aparecem em ações de sucesso
- [ ] Toasts aparecem em erros
- [ ] Toasts aparecem em avisos
- [ ] Posicionamento correto (top-right)

## 🔧 Funcionalidades

### SGCI Dashboard
- [ ] Empreendimentos aparecem
- [ ] Clientes aparecem
- [ ] Negociações aparecem
- [ ] Corretores aparecem
- [ ] Gráficos renderizam

### Cadastro de Corretor
- [ ] Formulário carrega
- [ ] Upload de foto funciona
- [ ] Validações funcionam
- [ ] Toast de sucesso aparece

## 📱 Responsividade

- [ ] Home responsiva (mobile/tablet/desktop)
- [ ] Dashboard responsivo
- [ ] Formulários responsivos
- [ ] Rodapés responsivos

## 🔒 Segurança

- [ ] Rotas protegidas redirecionam para login
- [ ] Cookies httpOnly configurados
- [ ] Tokens JWT funcionando
- [ ] Validações de entrada funcionando

