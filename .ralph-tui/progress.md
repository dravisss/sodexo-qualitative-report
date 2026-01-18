# Ralph Progress Log

This file tracks progress across iterations. It's automatically updated
after each iteration and included in agent prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

---

## ✓ Iteration 1 - US-001: Board com 4 Colunas
*2026-01-18T04:33:10.295Z (246s)*

**Status:** Completed

**Notes:**
yles as the column no longer exists\n\n### Acceptance Criteria Verification\n- [x] Board displays exactly 4 columns: Backlog, Em andamento, Bloqueado, Concluído\n- [x] No horizontal scroll on desktop (≥1024px)\n- [x] Columns 'A Fazer' and 'Em Andamento' from V1 consolidated into 'Em andamento'\n- [x] Migrated cards from 'todo' appear in 'Em andamento' with substatus badge\n- [x] Each column has equal width (25% of available space)\n\nCommitted as: `8ce20c3 feat: US-001 - Board com 4 Colunas`\n\n

---
## ✓ Iteration 2 - US-002: Arrastar Cards entre Colunas
*2026-01-18T04:36:15.517Z (184s)*

**Status:** Completed

**Notes:**
rotate(2deg)`), and teal border for semi-transparent visual indicator\n\n### Acceptance Criteria Met\n- [x] Drag-and-drop funciona entre todas as 4 colunas\n- [x] Ao mover para 'Em andamento', substatus é definido como 'todo' por padrão\n- [x] Estado é salvo automaticamente no Netlify Blobs após cada movimento\n- [x] Ordem dos cards dentro da coluna é preservada\n- [x] Indicador visual durante o arraste (card semi-transparente)\n\nCommit: `f877cf2 feat: US-002 - Arrastar Cards entre Colunas`\n\n

---
## ✓ Iteration 3 - US-003: Editar Tags no Editor
*2026-01-18T04:39:22.712Z (186s)*

**Status:** Completed

**Notes:**
`removeTag()` - removes a tag from the current editing list\n- Added `escapeHtml()` - prevents XSS when rendering tag content\n- Added `updateCardTagsDisplay()` - updates card DOM when tags are saved\n- Added `generateCardTagsHtml()` - generates tag HTML with up to 2 visible tags + \"+N\" indicator\n- Updated `createCardElement()` - includes user tags when rendering cards\n- Updated `handleEditorSave()` - persists tags to state\n- Updated `openEditor()` - loads existing tags into the editor\n\n

---
## ✓ Iteration 4 - US-004: Campo Envolver (Stakeholders)
*2026-01-18T04:44:28.274Z (304s)*

**Status:** Completed

**Notes:**
ge on initial render\n   - Updated `handleEditorSave()` to persist stakeholders\n\n**Acceptance Criteria Status:**\n- [x] Editor lateral exibe seção 'Envolver' com lista de pessoas\n- [x] Botão 'Adicionar pessoa' abre formulário com campos: Nome (obrigatório), Área (opcional), Contato (opcional)\n- [x] Cada pessoa na lista tem botão para remover\n- [x] Card exibe badge 👥 com contagem de pessoas (ex: 👥3)\n- [x] Badge não aparece se contagem é 0\n- [x] Dados são persistidos no estado do card\n\n

---
## ✓ Iteration 5 - US-005: Busca por ID/Título/Tag/Envolver
*2026-01-18T04:47:22.329Z (173s)*

**Status:** Completed

**Notes:**
e, tags, and stakeholders\n   - Updated `updateCounts()` to count only visible cards\n\n3. **css/kanban.css** - Added styles for search input with responsive design\n\n**Acceptance Criteria Met:**\n- Topbar displays search input with placeholder 'Buscar...'\n- Search filters cards in real-time with 300ms debounce\n- Matches: ID (I-XX), title, any tag, stakeholder name/area/contact\n- Case-insensitive search\n- Non-matching cards are hidden (display: none)\n- Clearing input restores all cards\n\n

---
## ✓ Iteration 6 - US-006: Filtro por Múltiplas Tags (AND)
*2026-01-18T04:51:47.544Z (264s)*

**Status:** Completed

**Notes:**
lect()` for tag selection/deselection\n- Added `renderSelectedTagsChips()` to display selected tags in topbar\n- Added `removeFilterTag()` to remove individual filter tags\n- Added `clearAllFilters()` to clear both search and tags\n- Added `applyFilters()` combining text search AND tag filters\n- Added `cardHasAllTags()` for AND logic on tag matching\n- Added `refreshTagPicker()` for dynamic updates when new tags are created\n- Modified `handleEditorSave()` to refresh tag picker after saving\n\n

---
## ✗ Iteration 7 - US-007: Detalhes Completos no Editor
*2026-01-18T04:55:54.118Z (246s)*

**Status:** Failed/Incomplete

---
## ✗ Iteration 8 - US-008: Anexar Arquivos
*2026-01-18T04:55:58.263Z (3s)*

**Status:** Failed/Incomplete

---
## ✗ Iteration 9 - US-010: Datas de Início e Final
*2026-01-18T04:56:02.665Z (3s)*

**Status:** Failed/Incomplete

---
