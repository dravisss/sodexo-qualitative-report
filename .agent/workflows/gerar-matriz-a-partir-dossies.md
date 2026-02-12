---
name: gerar-matriz-a-partir-dossies
description: Gerar/atualizar matriz consolidada a partir dos dossiês
---

# Workflow — Matriz consolidada (derivada dos dossiês)

## Entrada

- Conjunto de dossiês em `intervencoes/`

## Saída

- Um arquivo de matriz (a definir pelo usuário) com 1 linha por intervenção, derivada dos dossiês.

## Passos

1. Liste todos os `intervencoes/I-*.md`.
2. Para cada dossiê:
   - extraia unidade(s), frente, risco mitigado, força de evidência, top evidências, lacunas, pré-condições.
   - gere a linha usando `.agent/schemas/matriz-intervencoes.linha.template.md`.
3. Ordene (conforme pedido): por risco, viabilidade, força de evidência, ou frente.

## Critérios de qualidade

- Nada entra na matriz sem existir no dossiê.
- Linha contém referências rastreáveis.
