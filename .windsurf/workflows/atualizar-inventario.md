---
name: atualizar-inventario
description: Atualizar inventários (banco + blobs) e gerar relatório de delta para atualizar MoC
---

# Atualizar inventário (banco + blobs) — delta + relatório

## Entrada

- `.env` configurado (no mínimo `NETLIFY_DATABASE_URL`)
- Netlify CLI autenticado (para `netlify blobs:get`)
- Repo atualizado

## Saída

- Export atualizado em `evidencias/banco/`:
  - `submissions.json`
  - `answers.json`
  - `attachments.json`
  - `submissions_normalized.json`
- Snapshot do export anterior em `evidencias/banco/_previous/` (para cálculo de delta)
- Blobs novos baixados (somente delta) em `evidencias/blobs/<submission_id>/<field_id>/...`
- Cache atualizado em `evidencias/indice/attachments_cache.json`
- Tabelas derivadas (reconstrução de `table_cell`) em `evidencias/indice/tabelas/<submission_id>/table_*.{md,json}`
- Relatórios gerados:
  - `evidencias/indice/atualizacao-inventario.report.md`
  - `evidencias/indice/atualizacao-inventario.report.json`

## Passos

1. Garanta que o `.env` esteja carregado e a Netlify CLI esteja autenticada.
2. Rode o comando:

   ```bash
   npm run evidencias:atualizar-inventario
   ```

   Observação: por padrão o export usa `unit_slug=general`. Para recortes legados por unidade, use explicitamente:

   ```bash
   npm run evidencias:atualizar-inventario -- --unit cajamar,gru-food,gru-fm
   ```

   Ou para tudo:

   ```bash
   npm run evidencias:atualizar-inventario -- --all
   ```

3. Abra o relatório gerado:
   - `evidencias/indice/atualizacao-inventario.report.md`

   Fonte de verdade para auditoria: `evidencias/indice/atualizacao-inventario.report.json` (inclui `delta.submissions/answers/attachments_records`).

4. Atualize manualmente (a partir do relatório) os índices narrativos:
   - `evidencias/indice/inventario-geral.md`
   - `evidencias/indice/moc.md`

## Observações

- Este workflow **não** converte automaticamente XLSX→CSV nem roda Gemini/OCR; ele foca em:
  - sincronizar o export do banco
  - calcular delta (submissions/answers/attachments_records)
  - identificar anexos novos (por `blob_key`)
  - baixar os blobs novos
  - gerar um relatório pronto para colar/atualizar MoC e inventários
  - reconstruir tabelas do formulário (`field_type=table_cell`) em `evidencias/indice/tabelas/`
- Para PDFs de descrição de cargo, usar `npm run extract:cargos:gemini` quando aplicável.
