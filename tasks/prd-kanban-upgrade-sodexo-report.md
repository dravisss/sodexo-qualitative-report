# PRD: Kanban Upgrade (Sodexo Report)

## 1. Overview

### 1.1 Problem Statement
The current Kanban board in `publish-site` provides basic intervention tracking but lacks the features needed for professional governance: no tagging, no stakeholder tracking ("Envolver"), no file attachments, no search/filter capabilities, and no timeline visualization.

### 1.2 Solution
Evolve the existing Kanban (`kanban.html`, `js/kanban.js`) into a premium governance tool with:
- **4 columns** (consolidating current 5) with substatus for "Em andamento"
- **Free-form tags** with AND-based filtering
- **"Envolver" field** (Name + Area + Contact) for stakeholder tracking
- **Full intervention details** (Tensão/Descrição/Objetivo/Impacto) in editor
- **File attachments** via Netlify Blobs
- **Gantt-style Timeline view**

### 1.3 Success Metrics
- Users can locate interventions rapidly via search/filter
- Users maintain complete tracking (status, stakeholders, attachments, timeline)
- Zero horizontal scroll on desktop board view

---

## 2. User Stories

### US-01: Board com 4 Colunas
- **Phase:** 1 - Foundation
- **Title:** Visualizar board com 4 colunas sem scroll horizontal
- **Description:** Como usuário, quero ver o board com 4 colunas (Backlog, Em andamento, Bloqueado, Concluído) sem scroll horizontal, para acompanhar o todo de forma executiva.
- **Acceptance Criteria:**
  1. Board exibe exatamente 4 colunas: Backlog, Em andamento, Bloqueado, Concluído
  2. Não há scroll horizontal em desktop (≥1024px)
  3. Colunas "A Fazer" e "Em Andamento" do V1 são consolidadas em "Em andamento"
  4. Cards migrados de `todo` e `doing` aparecem em "Em andamento" com substatus correspondente
  5. Cada coluna tem largura igual (25% do espaço disponível)
- **Priority:** High
- **Dependencies:** None

### US-02: Arrastar Cards entre Colunas
- **Phase:** 1 - Foundation
- **Title:** Mover cards via drag-and-drop para atualizar status
- **Description:** Como usuário, quero mover cards entre colunas arrastando, para atualizar o status das intervenções.
- **Acceptance Criteria:**
  1. Drag-and-drop funciona entre todas as 4 colunas
  2. Ao mover para "Em andamento", substatus é definido como `todo` por padrão
  3. Estado é salvo automaticamente no Netlify Blobs após cada movimento
  4. Ordem dos cards dentro da coluna é preservada
  5. Indicador visual durante o arraste (card semi-transparente)
- **Priority:** High
- **Dependencies:** US-01

### US-03: Editar Tags no Editor
- **Phase:** 1 - Foundation
- **Title:** Gerenciar tags para categorizar intervenções
- **Description:** Como usuário, quero editar tags no editor lateral, para categorizar as intervenções.
- **Acceptance Criteria:**
  1. Editor lateral exibe seção "Tags" com input de texto
  2. Usuário pode adicionar tag pressionando Enter ou vírgula
  3. Tags aparecem como chips com botão ✕ para remover
  4. Tags são normalizadas: trim, lowercase para comparação, sem duplicatas
  5. Card exibe até 2 tags como chips + indicador "+N" se houver mais
  6. Tags são persistidas no estado do card
- **Priority:** High
- **Dependencies:** US-01

### US-04: Campo Envolver (Stakeholders)
- **Phase:** 1 - Foundation
- **Title:** Registrar pessoas envolvidas com nome, área e contato
- **Description:** Como usuário, quero editar o campo "Envolver" (Nome/Área/Contato) no editor, para saber quem contatar sobre cada intervenção.
- **Acceptance Criteria:**
  1. Editor lateral exibe seção "Envolver" com lista de pessoas
  2. Botão "Adicionar pessoa" abre formulário com campos: Nome (obrigatório), Área (opcional), Contato (opcional)
  3. Cada pessoa na lista tem botão para remover
  4. Card exibe badge 👥 com contagem de pessoas (ex: 👥3)
  5. Badge não aparece se contagem é 0
  6. Dados são persistidos no estado do card
- **Priority:** High
- **Dependencies:** US-01

### US-05: Busca por ID/Título/Tag/Envolver
- **Phase:** 2 - Search & Details
- **Title:** Buscar intervenções por texto
- **Description:** Como usuário, quero buscar por id/título/tag/envolver, para encontrar intervenções rapidamente.
- **Acceptance Criteria:**
  1. Topbar exibe input de busca com placeholder "Buscar..."
  2. Busca filtra cards em tempo real (debounce 300ms)
  3. Match em: ID (I-XX), título, qualquer tag, nome/área/contato de envolver
  4. Busca é case-insensitive
  5. Cards não correspondentes ficam ocultos (não apenas esmaecidos)
  6. Limpar input restaura todos os cards
- **Priority:** High
- **Dependencies:** US-03, US-04

### US-06: Filtro por Múltiplas Tags (AND)
- **Phase:** 2 - Search & Details
- **Title:** Filtrar por tags selecionadas em modo AND
- **Description:** Como usuário, quero filtrar por múltiplas tags em modo AND, para refinar a visualização.
- **Acceptance Criteria:**
  1. Topbar exibe tag picker (dropdown multi-select) com todas as tags únicas
  2. Tags selecionadas aparecem como chips na topbar com ✕ para remover
  3. Filtro é AND: card deve conter TODAS as tags selecionadas
  4. Filtro combina com busca textual: resultado = (match busca) AND (todas tags)
  5. Botão "Limpar" remove busca + tags selecionadas
  6. Tag picker atualiza dinamicamente quando novas tags são criadas
- **Priority:** High
- **Dependencies:** US-03, US-05

### US-07: Detalhes Completos no Editor
- **Phase:** 2 - Search & Details
- **Title:** Exibir Tensão/Descrição/Objetivo/Impacto no editor
- **Description:** Como usuário, quero ver Tensão/Descrição/Objetivo/Impacto completos no editor, para ter o contexto integral da intervenção.
- **Acceptance Criteria:**
  1. Editor exibe 4 seções colapsáveis: Tensão, Descrição, Objetivo, Impacto
  2. Seções são read-only (conteúdo vem do Markdown)
  3. Por padrão, seções estão expandidas
  4. Parser extrai conteúdo do Markdown por label (case-insensitive)
  5. Se label não existir no Markdown, exibe "—"
  6. Conteúdo preserva formatação (negrito, listas, etc.)
- **Priority:** Medium
- **Dependencies:** US-01

### US-08: Anexar Arquivos
- **Phase:** 2 - Search & Details
- **Title:** Upload, download e remoção de anexos
- **Description:** Como usuário, quero anexar arquivos e baixar/remover anexos, para centralizar evidências.
- **Acceptance Criteria:**
  1. Editor exibe seção "Anexos" com botão "Adicionar arquivo"
  2. Upload aceita: pdf, csv, xls, xlsx, docx, pptx, png, jpg, jpeg
  3. Limite: 10MB por arquivo, 50MB total por card
  4. Lista de anexos exibe: nome, tamanho, botão download, botão remover
  5. Arquivos são armazenados em Netlify Blobs via `/api/kanban-attachment`
  6. Card exibe badge 📎 com contagem de anexos
  7. Badge não aparece se contagem é 0
  8. Remoção deleta do Blobs e atualiza estado
- **Priority:** Medium
- **Dependencies:** US-01

### US-09: Visual Premium
- **Phase:** 3 - Polish & Timeline
- **Title:** UI com visual premium e consistente
- **Description:** Como usuário, quero que a UI tenha visual premium e consistente com o relatório, para uma experiência profissional.
- **Acceptance Criteria:**
  1. Cores seguem variáveis CSS do SIN Design System
  2. Transições suaves em hover, drag, abrir/fechar editor (200-300ms)
  3. Sombras e bordas consistentes com o relatório principal
  4. Tipografia hierárquica (títulos, labels, conteúdo)
  5. Estados de loading com skeleton ou spinner
  6. Responsivo: mobile com tabs para colunas
- **Priority:** Medium
- **Dependencies:** US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08

### US-10: Datas de Início e Final
- **Phase:** 3 - Polish & Timeline
- **Title:** Definir e visualizar datas nos cards
- **Description:** Como usuário, quero definir Data de início e Data final e vê-las no card, para fazer gestão de prazos.
- **Acceptance Criteria:**
  1. Editor exibe campos "Data de início" e "Data final" com date pickers
  2. Formato de armazenamento: YYYY-MM-DD
  3. Card exibe datas no formato compacto: "📅 15/01 → 28/02"
  4. Se apenas uma data definida, exibe só ela
  5. Se nenhuma data, não exibe linha de datas
  6. Validação: Data final não pode ser anterior à Data de início
- **Priority:** Medium
- **Dependencies:** US-01

### US-11: View Timeline (Gantt)
- **Phase:** 3 - Polish & Timeline
- **Title:** Alternar entre view Board e Timeline
- **Description:** Como usuário, quero alternar entre view Board e Timeline, para acompanhar cronograma e sobreposições.
- **Acceptance Criteria:**
  1. Topbar exibe toggle [Board] [Timeline]
  2. Timeline exibe eixo horizontal com semanas/meses
  3. Cards com startDate/endDate aparecem como barras horizontais
  4. Cor da barra indica status: cinza=backlog, azul=andamento, vermelho=bloqueado, verde=concluído
  5. Cards sem datas agrupados em seção "Sem datas" abaixo do gráfico
  6. Click na barra abre editor do card
  7. Timeline usa mesmo filtro/busca aplicado ao Board
- **Priority:** Low
- **Dependencies:** US-10

---

## 3. Data Model

### 3.1 State Schema (V2)
```typescript
type KanbanStateV2 = {
  version: 2;
  cards: Record<string, CardState>;
  order: {
    backlog: string[];
    in_progress: string[];
    blocked: string[];
    done: string[];
  };
  meta?: { updatedAt: string };
};

type CardState = {
  status: 'backlog' | 'in_progress' | 'blocked' | 'done';
  substatus?: 'todo' | 'doing';
  responsible?: string;
  startDate?: string;
  endDate?: string;
  updates?: string;
  tags?: string[];
  involve?: { name: string; area?: string; contact?: string }[];
  attachments?: {
    id: string;
    name: string;
    mime: string;
    size: number;
    blobKey: string;
    createdAt: string;
  }[];
  updatedAt?: string;
};
```

### 3.2 Migration V1 → V2
| V1 Status | V2 Status | V2 Substatus |
|-----------|-----------|--------------|
| `backlog` | `backlog` | — |
| `todo` | `in_progress` | `todo` |
| `doing` | `in_progress` | `doing` |
| `blocked` | `blocked` | — |
| `done` | `done` | — |

---

## 4. API Specification

### 4.1 Existing Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/kanban-state` | Retrieve state (V2) |
| POST | `/api/kanban-state` | Save state (V2) |

### 4.2 New Endpoints (Attachments)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kanban-attachment` | Upload (multipart/form-data) |
| GET | `/api/kanban-attachment/:blobKey` | Download |
| DELETE | `/api/kanban-attachment/:blobKey` | Remove |

---

## 5. Technical Notes

### Files to Modify
- `kanban.html` - Topbar, column structure, view toggle
- `js/kanban.js` - V2 state, search/filter, timeline, editor enhancements
- `css/kanban.css` - 4-column layout, tags, badges, timeline, mobile tabs
- `netlify/functions/kanban-state.mjs` - V2 compatibility
- `netlify/functions/kanban-attachment.mjs` - New file for attachments

### Non-Goals
- No authentication or permissions
- No real-time collaboration (keep polling)
- No changes to publish-site architecture
- No removal of localStorage fallback