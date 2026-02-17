---
name: sodexo-memory-index
description: CRITICAL / MANDATORY. Run this skill AFTER any edit to Analysis Notes, Claims, MoC, or Narrative files. Updates the isolated Memora database to keep semantic search fresh. 
---

# Sodexo Memory Indexer

This skill indexes the current state of the Sodexo project into Memora, enabling semantic search over:
1. **Full Analysis Notes**: From `evidencias/notas/**/*.analise.md` (metadata, summaries, gaps).
2. **Evidence Claims**: Granular facts extracted from analysis notes.
3. **Survey Responses**: Critical Q&A from the project survey (e.g., break-even).
4. **Narrative**: From `Refined/*.md` (chapters and reporting).
5. **Map of Content**: From `evidencias/indice/moc.md` (file inventory).
6. **Interventions**: (Note: currently excluded by default to avoid stale text pollution).

### Opção Recomendada (Direto no Banco Isolado):
Para garantir que a indexação ocorra mesmo com instabilidades no MCP da IDE:
```bash
python .agent/skills/sodexo-memory-index/index_sodexo.py --direct
```

### Opção Padrão (via MCP):
```bash
python .agent/skills/sodexo-memory-index/index_sodexo.py
```
```bash
python .agent/skills/sodexo-memory-index/index_sodexo.py --dry-run
```

## Strategy

The script uses a **Wipe & Replace** strategy per category to prevent stale data:
- **Interventions**: Deletes all memories tagged `#intervencao` before re-indexing.
- **Narrative**: Deletes all memories tagged `#narrativa` before re-indexing.
- **Claims**: Deletes all memories tagged `#claim` before re-indexing.

## Tags

- `#sodexo` (Global project tag)
- `#analise` / `#document-analysis` (Meticulous full analysis)
- `#survey-response` / `#question_XX`
- `#claim` / `#evidencia` (Granular data)
- `#narrativa` / `#relatorio`
- `#moc-entry` (Inventory entries)
