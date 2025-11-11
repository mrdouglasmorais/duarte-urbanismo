# 📄 Gerador de Recibos em PDF

Sistema completo para geração de recibos em PDF com QR Code único, desenvolvido em Next.js 14.

## ✨ Funcionalidades

- ✅ Geração de recibos em PDF profissionais
- ✅ QR Code único para autenticidade
- ✅ Conversão automática de valores para extenso
- ✅ Preview em tempo real do recibo
- ✅ Interface moderna e responsiva
- ✅ Formatação automática de CPF/CNPJ
- ✅ Diversos métodos de pagamento
- ✅ Design profissional e imprimível

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **jsPDF** - Geração de PDF
- **QRCode** - Geração de QR Codes
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🎯 Como Usar

1. Acesse `http://localhost:3000`
2. Preencha o formulário com os dados do recibo:
   - Número do recibo (gerado automaticamente)
   - Data do recibo
   - Valor (convertido automaticamente para extenso)
   - Dados do pagador (nome e CPF/CNPJ)
   - Descrição do serviço/produto
   - Forma de pagamento
   - Dados do emitente
3. Clique em **"Visualizar"** para ver o preview
4. Clique em **"Gerar PDF"** para fazer download do recibo

## 📋 Estrutura do Projeto

```
duarte-urbanismo/
├── app/
│   ├── api/
│   │   └── gerar-pdf/
│   │       └── route.ts          # API para geração de PDF
│   ├── page.tsx                  # Página principal com formulário
│   ├── layout.tsx                # Layout raiz
│   └── globals.css               # Estilos globais
├── components/
│   └── ReciboPreview.tsx         # Componente de preview do recibo
├── lib/
│   └── utils.ts                  # Funções utilitárias
├── types/
│   └── recibo.ts                 # Tipos TypeScript
└── public/                       # Arquivos estáticos
```

## 🎨 Personalização

### Alterar cores do recibo

Edite o arquivo `components/ReciboPreview.tsx` e `app/api/gerar-pdf/route.ts` para modificar as cores utilizadas no design do recibo.

### Adicionar campos personalizados

1. Adicione o campo no tipo `ReciboData` em `types/recibo.ts`
2. Adicione o input no formulário em `app/page.tsx`
3. Atualize o componente `ReciboPreview.tsx`
4. Atualize a API de geração em `app/api/gerar-pdf/route.ts`

## 📱 Recursos do Recibo

O recibo gerado inclui:

- **Header profissional** com título destacado
- **Box de valor** em destaque com conversão para extenso
- **Dados do pagador** (nome e CPF/CNPJ)
- **Descrição detalhada** do serviço/produto
- **Forma de pagamento**
- **Dados completos do emitente**
- **QR Code único** para verificação
- **Linha de assinatura**
- **Nota de autenticidade** no rodapé

## 🔐 QR Code

O QR Code gerado contém:
- Número do recibo
- Valor
- Data
- Nome do emitente
- Hash único para validação

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ para Duarte Urbanismo

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
