---
name: indexar-evidencia-no-moc
description: Ler evidência e indexar no MoC (com links para intervenções)
---

# Workflow — Indexar evidência no MoC

## Entrada

- Path de evidência (PDF/blob/arquivo do banco exportado)

## Saída

- Entrada/atualização em `evidencias/indice/moc.md` com:
  - resumo fiel
  - fatos/trechos
  - candidatos de `I-XX`

## Passos

1. Identifique o tipo: Banco | PDF | Blob.
2. Extraia:
   - 5–15 pontos factuais
   - números/datas/cláusulas quando houver
   - trechos citáveis
3. Escreva no MoC:
   - resumo (5–12 linhas)
   - lista de achados
   - quais intervenções isso sustenta (citar `I-XX`)
4. Se houver ambiguidade, registre como hipótese e crie uma lacuna.

## Critérios de qualidade

- Nada “inventado”; todo fato tem referência.
- Intervenções sugeridas têm justificativa explícita.
