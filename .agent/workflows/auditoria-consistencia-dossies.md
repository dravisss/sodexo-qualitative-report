---
name: auditoria-consistencia-dossies
description: Auditar consistência entre dossiês, MoC e matriz
---

# Workflow — Auditoria de consistência

## Objetivo

Encontrar contradições, duplicações e claims sem fonte.

## Entrada

- Dossiês em `intervencoes/`
- MoC em `evidencias/indice/moc.md`
- (Opcional) matriz consolidada

## Passos

1. Varra cada dossiê e identifique:
   - claims sem referência
   - evidências duplicadas em intervenções diferentes (ok se justificadas)
   - lacunas repetidas (candidatas a “investigação transversal”)
2. Compare com MoC:
   - se o dossiê cita um PDF/blob, confira se está indexado no MoC.
3. Gere uma lista de “ajustes recomendados” priorizada por risco.

## Saída

- Relatório curto de inconsistências
- Ações recomendadas (arquivos a atualizar)
