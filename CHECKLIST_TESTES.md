# ✅ Checklist de Testes - Sistema Duarte Urbanismo

## 🎯 Objetivo
Verificar todas as funcionalidades do sistema antes de produção.

---

## 🔐 Autenticação

### Login
- [ ] Login com credenciais válidas (`gestor@sgci.com` / `123456`)
- [ ] Redirecionamento após login bem-sucedido
- [ ] Login com credenciais inválidas mostra erro
- [ ] Cookie `sgci-auth` é criado após login
- [ ] Middleware bloqueia acesso sem autenticação

### Logout
- [ ] Botão de logout funciona
- [ ] Cookie é removido após logout
- [ ] Redirecionamento para `/login` após logout

---

## 📊 Dashboard

### Visão Geral
- [ ] Cards de indicadores exibem dados corretos
- [ ] Gráfico de pizza (Recebido vs Pendente) renderiza
- [ ] Gráfico de barras (Pendentes por mês) renderiza
- [ ] Gráfico de corretores renderiza
- [ ] Estatísticas rápidas estão corretas

### Navegação
- [ ] Links do menu funcionam
- [ ] Breadcrumbs corretos
- [ ] Mensagem de saudação personalizada aparece

---

## 🏢 Empreendimentos

### CRUD Completo
- [ ] Listar empreendimentos
- [ ] Criar novo empreendimento
- [ ] Editar empreendimento existente
- [ ] Deletar empreendimento
- [ ] Validação de campos obrigatórios
- [ ] Formatação de valores monetários

---

## 👥 Clientes

### CRUD Completo
- [ ] Listar clientes
- [ ] Criar novo cliente (PF)
- [ ] Criar novo cliente (PJ)
- [ ] Editar cliente existente
- [ ] Deletar cliente
- [ ] Validação de CPF/CNPJ
- [ ] Validação de email
- [ ] ViaCEP funciona para buscar endereço

---

## 👔 Corretores

### CRUD Completo
- [ ] Listar corretores
- [ ] Criar novo corretor
- [ ] Editar corretor existente
- [ ] Deletar corretor
- [ ] Validação de CRECI

---

## 💼 Negociações

### CRUD Completo
- [ ] Listar negociações
- [ ] Criar nova negociação
- [ ] Editar negociação existente
- [ ] Deletar negociação
- [ ] Seleção de cliente funciona
- [ ] Seleção de unidade funciona
- [ ] Seleção de corretor funciona
- [ ] Campos de permuta funcionam
- [ ] Cálculo de parcelas funciona

### Parcelas
- [ ] Visualizar parcelas de uma negociação
- [ ] Criar nova parcela
- [ ] Editar parcela existente
- [ ] Alterar status de parcela (Paga/Pendente)
- [ ] Validação de valores
- [ ] Validação de datas

### Recibos
- [ ] Gerar recibo para parcela
- [ ] PDF é baixado corretamente
- [ ] Recibo contém todas as informações:
  - [ ] Dados do pagador
  - [ ] Dados do empreendimento
  - [ ] Número do lote
  - [ ] Número da parcela
  - [ ] Dados do corretor
  - [ ] Status (Pago/Pendente)
  - [ ] Data de emissão
  - [ ] Data de pagamento/vencimento
  - [ ] Hash de autenticação
  - [ ] QR Code de verificação
  - [ ] QR Code PIX (se pendente)
  - [ ] Dados bancários (se pendente)
- [ ] Link de compartilhamento funciona
- [ ] Recibo compartilhado exibe corretamente
- [ ] Botão de imprimir funciona
- [ ] Botão de gerar PDF funciona

---

## 🧾 Recibos Públicos

### Página Pública
- [ ] Acessar `/recibos` sem autenticação
- [ ] Formulário de geração funciona
- [ ] Preview do recibo aparece
- [ ] QR Code é gerado
- [ ] Validação de campos funciona

### Compartilhamento
- [ ] Link compartilhado funciona
- [ ] Recibo compartilhado exibe todos os dados
- [ ] Hash de autenticação está presente
- [ ] QR Code de verificação funciona

---

## 💾 Banco de Dados

### MongoDB
- [ ] Conexão com MongoDB funciona
- [ ] Seed de dados funciona (`/api/sgci/seed`)
- [ ] Reset de dados funciona (`/api/reset`)
- [ ] Dados são persistidos corretamente
- [ ] Sincronização entre cliente e servidor funciona

### Coleções
- [ ] `sgci_empreendimentos` - dados corretos
- [ ] `sgci_clientes` - dados corretos
- [ ] `sgci_corretores` - dados corretos
- [ ] `sgci_negociacoes` - dados corretos
- [ ] `recibos` - dados corretos
- [ ] `usuarios` - dados corretos

---

## 🎨 UI/UX

### Responsividade
- [ ] Layout funciona em desktop
- [ ] Layout funciona em tablet
- [ ] Layout funciona em mobile
- [ ] Menu responsivo funciona

### Acessibilidade
- [ ] Navegação por teclado funciona
- [ ] Contraste de cores adequado
- [ ] Labels de formulários corretos

### Performance
- [ ] Páginas carregam rapidamente
- [ ] Gráficos renderizam sem travamentos
- [ ] Formulários respondem rapidamente

---

## 🔒 Segurança

### Rotas Protegidas
- [ ] `/painel/*` requer autenticação
- [ ] APIs protegidas retornam erro sem auth
- [ ] Cookies httpOnly configurados

### Validações
- [ ] Inputs são sanitizados
- [ ] SQL Injection não é possível (MongoDB)
- [ ] XSS prevenido

---

## 📱 Funcionalidades Especiais

### ViaCEP
- [ ] Busca de CEP funciona
- [ ] Preenchimento automático de endereço
- [ ] Máscara de CEP funciona

### PIX
- [ ] QR Code PIX é gerado
- [ ] Payload PIX está correto
- [ ] Código copia e cola funciona

### PDF
- [ ] PDF é gerado corretamente
- [ ] Logo aparece no PDF
- [ ] Formatação está correta
- [ ] Impressão funciona

---

## 🐛 Tratamento de Erros

### Erros de Rede
- [ ] Erro de conexão é exibido
- [ ] Mensagens de erro são claras
- [ ] Sistema não quebra com erros

### Validações
- [ ] Erros de validação são exibidos
- [ ] Campos obrigatórios são marcados
- [ ] Formatação incorreta é rejeitada

---

## 📝 Observações

**Data dos Testes:** _______________

**Testador:** _______________

**Ambiente:** [ ] Desenvolvimento [ ] Produção

**Navegador:** _______________

**Versão:** _______________

---

## ✅ Resultado Final

- [ ] Todos os testes passaram
- [ ] Sistema pronto para produção
- [ ] Documentação atualizada

**Assinatura:** _______________

**Data:** _______________

