---
name: extrair-claims-e-evidencias
description: Extrair claims verificáveis e evidências citáveis de PDFs/blobs/banco, com referência completa e ligação a intervenções
---

# Skill — Extrair claims e evidências (auditável)

## Quando usar

- Ao ler um PDF, blob (xlsx/zip), ou resposta de banco, e precisar transformar em material citável.

## Saída esperada

- Lista estruturada:
  - Claim (o que o documento afirma/mostra)
  - Evidência (trecho/dado)
  - Referência completa (path + contexto)
  - Intervenções candidatas (I-XX) + justificativa

## Procedimento

1. Liste 5–20 claims (curtas e verificáveis).
2. Para cada claim, inclua:
   - “Evidência”: trecho literal quando possível.
   - “Referência”: caminho + localização (página, seção, planilha, aba, linha; ou `submission_id`).
3. Marque o status:
   - Provado | Sustentado qualitativamente | Hipótese
4. Proponha onde registrar:
   - MoC (`evidencias/indice/moc.md`) e/ou dossiê de `I-XX`.
