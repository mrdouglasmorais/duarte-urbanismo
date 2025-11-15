# Migração de Dados Mockados para Seeds

Este documento descreve as mudanças realizadas para remover todos os dados mockados do projeto e substituí-los por seeds do MongoDB.

## Mudanças Realizadas

### 1. Seed de Empreendimentos
- **Arquivo criado**: `lib/seeds/empreendimentos-seed.ts`
- **Conteúdo**:
  - Seed de unidades do empreendimento (6 lotes de exemplo)
  - Seed de configuração do empreendimento em destaque (dados da landing page)
  - Função `seedEmpreendimentos()` para popular o MongoDB

### 2. APIs Criadas

#### `/api/public/empreendimento-destaque`
- Retorna dados do empreendimento em destaque para a landing page pública
- Busca da collection `sgci_empreendimentos_config`

#### `/api/public/empreendimento-destaque-dashboard`
- Retorna dados formatados do empreendimento em destaque para o dashboard
- Formata dados para o formato esperado pelo componente

#### `/api/contato`
- Salva mensagens de contato da landing page no MongoDB
- Collection: `sgci_contatos`

#### `/api/admin/seed`
- Endpoint protegido para executar todos os seeds
- Apenas administradores podem executar
- Executa seeds de Firebase Users e Empreendimentos

### 3. Landing Page (`app/page.tsx`)
- **Removido**: Dados hardcoded (`dadosEmpreendimento`, `estatisticas`, `galleryImages`)
- **Adicionado**: Busca dinâmica dos dados do MongoDB via API
- **Estado**: `empreendimentoConfig` carregado do banco
- **Fallback**: Dados padrão caso não carregue do banco (apenas para evitar erros)

### 4. Dashboard (`app/(dashboard)/painel/page.tsx`)
- **Removido**: Objeto `destaque` hardcoded
- **Adicionado**: Busca dinâmica dos dados do MongoDB via API
- **Estado**: `destaque` carregado do banco
- **Fallback**: Dados padrão caso não carregue do banco

### 5. Formulário de Contato
- **Removido**: Simulação de envio (comentário)
- **Adicionado**: Integração real com API `/api/contato`
- **Persistência**: Mensagens salvas no MongoDB

## Collections MongoDB Criadas

1. **`sgci_empreendimentos`**: Unidades/lotes do empreendimento
2. **`sgci_empreendimentos_config`**: Configuração e dados de marketing do empreendimento
3. **`sgci_contatos`**: Mensagens de contato da landing page

## Como Executar os Seeds

### Opção 1: Via API (Recomendado)
```bash
# Faça login como administrador e execute:
POST /api/admin/seed
```

### Opção 2: Via Script
```bash
npx ts-node scripts/seed-all.ts
```

## Estrutura dos Seeds

### Empreendimento Config
```typescript
{
  id: string;
  nome: string;
  titulo: string;
  descricao: string;
  localizacao: string[];
  caracteristicas: string[];
  investimento: string[];
  contato: string;
  estatisticas: Array<{valor, unidade, descricao}>;
  galleryImages: string[];
  emDestaque: boolean;
  criadoEm: string;
}
```

## Próximos Passos

1. Executar os seeds para popular o banco de dados inicial
2. Verificar se a landing page está carregando dados corretamente
3. Verificar se o dashboard está exibindo dados corretamente
4. Testar o formulário de contato

## Notas Importantes

- Todos os dados mockados foram removidos
- A aplicação agora depende 100% do MongoDB
- Seeds podem ser executados múltiplas vezes (limpam e recriam dados)
- Fallbacks foram mantidos apenas para evitar erros de renderização

