# [TASK] IDs Estáveis no Formulário de Investigação (Estratégia 1)

Este checklist implementa o plano `TODO/[PLAN]ids-estaveis-formulario.md` com foco em **zero perda** (nuvem + localStorage + exportações) e em migração automática de campos e anexos.

---

## 0) Pré-requisitos e Segurança (não pular)

- [ ] Confirmar arquivo alvo do formulário: `Refined/roteiro-investigacao-unidades.md`.
- [ ] Confirmar ponto de renderização: `js/app.js` (condição `articlePath.includes('roteiro-investigacao-unidades')`).
- [ ] Confirmar persistência: `localStorage` chave `investigation_form_data` + sync `/api/sync-submissions`.

### 0.1 Backups obrigatórios

- [ ] Backup local: exportar `localStorage['investigation_form_data']` para arquivo JSON (dump manual via console do navegador).
- [ ] Backup local: exportar `localStorage['investigation_form_meta`].
- [ ] Backup nuvem: chamar `/api/get-submission?unit=general` e salvar o JSON retornado.
- [ ] Backup anexos: garantir que `attachments` retornam para o submission (chaves `field_id`, `file_name`, `blob_key`).

### 0.2 Smoke test baseline (antes de alterar)

- [ ] Abrir o artigo `Roteiro de Investigação`.
- [ ] Validar que campos existentes (tabela e perguntas) carregam com valores.
- [ ] Validar que anexos existentes exibem ✅ e link de download.
- [ ] Tirar screenshot de 1-2 tabs como baseline.

---

## 1) Feature Toggle (rollback instantâneo)

- [ ] Criar flags em `js/config.js` (ou módulo equivalente):
  - [ ] `STABLE_FIELD_IDS_ENABLED` (default `false`).
  - [ ] `LEGACY_TO_STABLE_MIGRATION_ENABLED` (default `false`).
- [ ] Garantir que quando `STABLE_FIELD_IDS_ENABLED` for `false`, o comportamento atual permanece 100% idêntico.

Critério:

- [ ] Toggle desligado não altera IDs, nem UI, nem armazenamento.

---

## 2) Parser de tags no Markdown (IDs explícitos)

### 2.1 Definir convenção

- [ ] Campo resposta: `[[id: <field_id>]]`
- [ ] Campo anexo: `[[file: <field_id>]]`

Regras:

- [ ] IDs únicos por documento.
- [ ] IDs apenas com `a-z`, `0-9`, `_` (padronização).

### 2.2 Implementar utilitário de extração

- [ ] Em `js/app.js`, criar função utilitária (sem comentários novos):
  - [ ] `extractStableIdTag(text, kind)` onde `kind` é `id` ou `file`.
  - [ ] Retorna `{ id, cleanedText }`.

### 2.3 Renderizar perguntas com IDs estáveis

- [ ] No trecho que processa `li` (perguntas):
  - [ ] Se `STABLE_FIELD_IDS_ENABLED`:
    - [ ] Procurar `[[id: ...]]` dentro do texto do `li`.
    - [ ] Se encontrado, usar esse valor como `fieldId` em vez de `question_${index}`.
    - [ ] Remover a tag do texto visível.
  - [ ] Se não encontrado, manter `question_${index}` (compat).

### 2.4 Renderizar anexos com IDs estáveis

- [ ] Se `STABLE_FIELD_IDS_ENABLED`:
  - [ ] Procurar `[[file: ...]]`.
  - [ ] Se encontrado, usar esse valor como `fileId` em vez de `question_${index}_file`.
  - [ ] Remover a tag do texto visível.
- [ ] Caso não exista tag `[[file: ...]]`, manter regra atual baseada em `[Anexar]`.

### 2.5 Tabelas (fase 1)

- [ ] Não alterar a regra de IDs em tabela nesta fase (manter `table_*`).
- [ ] Apenas habilitar IDs estáveis para perguntas (lista) primeiro.

Critério:

- [ ] Com toggle ligado, uma pergunta com `[[id: ...]]` gera input/textarea com `id` exatamente igual.
- [ ] Com toggle desligado, nada muda.

---

## 3) Migração Legado → Estável (campos e anexos)

### 3.1 Definir mapa de migração

- [ ] Criar objeto `LEGACY_FIELD_ID_MAP` no `js/app.js` (ou arquivo dedicado importado) com pares:
  - [ ] `oldFieldId: newFieldId`

Inclui anexos:

- [ ] Para cada par base, também mapear:
  - [ ] `oldFileId` -> `newFileId`
  - [ ] `oldFileId_blob` -> `newFileId_blob`

### 3.2 Implementar função idempotente

- [ ] Criar função `migrateLegacyAnswersToStable()`:
  - [ ] Ler `investigation_form_data`.
  - [ ] Para cada `old -> new`:
    - [ ] Se `new` está vazio e `old` tem valor, copiar.
    - [ ] Não sobrescrever se `new` já possui valor.
  - [ ] Salvar no `localStorage`.
  - [ ] Retornar contagem de chaves migradas.

### 3.3 Ponto de execução

- [ ] Executar migração:
  - [ ] Depois de renderizar o HTML do form.
  - [ ] Antes do `loadFormAnswers()` final.
  - [ ] Somente se `LEGACY_TO_STABLE_MIGRATION_ENABLED`.

### 3.4 Sincronização

- [ ] Após migração, disparar `autoSave.syncToCloud()` (debounced ou direto) para persistir os novos IDs.

Critérios:

- [ ] Um valor salvo em `question_12` aparece automaticamente no novo campo `due_...`.
- [ ] Um anexo com `question_12_file_blob` funciona via link de download no novo campo `due_..._file`.

---

## 4) Atualizar o Markdown (mínimo necessário para validar)

- [ ] Editar `Refined/roteiro-investigacao-unidades.md` apenas em 1-3 perguntas (piloto):
  - [ ] Adicionar `[[id: ...]]` em uma pergunta já respondida.
  - [ ] Adicionar `[[file: ...]]` em uma pergunta já anexada.
  - [ ] Não reordenar outras perguntas ainda.

Critérios:

- [ ] As respostas existentes aparecem nesses novos campos.
- [ ] Nenhum outro campo “some”.

---

## 5) Smoke tests (pós-mudança)

### 5.1 Toggle desligado

- [ ] Com `STABLE_FIELD_IDS_ENABLED=false`, validar baseline igual ao antes.

### 5.2 Toggle ligado

- [ ] Ligar `STABLE_FIELD_IDS_ENABLED=true` e `LEGACY_TO_STABLE_MIGRATION_ENABLED=true`.
- [ ] Abrir roteiro.
- [ ] Validar:
  - [ ] Campos novos preenchidos via migração.
  - [ ] Anexos novos com ✅ e download.
  - [ ] Nenhuma perda de valores existentes.
- [ ] Validar dashboard/export (se aplicável) continua funcionando.

### 5.3 Teste offline

- [ ] Desligar internet.
- [ ] Alterar um campo estável.
- [ ] Confirmar que fica salvo em `localStorage`.
- [ ] Religar internet e confirmar sincronização.

---

## 6) Fase 2: Migração de tabelas para perguntas (quando fase 1 estiver validada)

- [ ] Para cada linha “complexa” de tabela que será removida:
  - [ ] Criar pergunta específica com `[[id: ...]]` e `[[file: ...]]`.
  - [ ] Mapear `table_*` correspondente para o novo ID.
  - [ ] Manter tabela apenas com KPIs simples.
- [ ] Repetir smoke tests.

---

## 7) Rollback

- [ ] Se qualquer inconsistência ocorrer:
  - [ ] Desligar toggles.
  - [ ] Confirmar que UI volta a mostrar campos legados.
  - [ ] Confirmar que dados permanecem no storage/DB.

---

## Pronto para refatorar o formulário

Critérios finais de aceite:

- [ ] Zero perda comprovada (antes e depois) em:
  - [ ] UI.
  - [ ] localStorage.
  - [ ] nuvem.
  - [ ] anexos.
- [ ] IDs estáveis funcionam.
- [ ] Migração é idempotente e não sobrescreve respostas novas.
- [ ] Toggle permite rollback instantâneo.
