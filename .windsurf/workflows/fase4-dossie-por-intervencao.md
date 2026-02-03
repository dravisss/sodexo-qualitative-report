---
name: fase4-dossie-por-intervencao
description: Criar/atualizar dossiê por intervenção (Fase 4)
---

# Workflow — Fase 4: Dossiê por intervenção

## Entrada

- `I-XX` alvo
- Conjunto de evidências candidatas (paths em `evidencias/` + itens do `moc.md`)

## Saída

- Arquivo atualizado/criado: `intervencoes/I-XX-<slug>.md`
- Dossiê com rastreabilidade e lacunas explícitas

## Passos

1. Confirme a intervenção e a unidade (Cajamar / Guarulhos Food / Guarulhos FM / transversal).
2. Abra/levantamento do que já existe:
   - Se o dossiê existe, leia o arquivo.
   - Se não existe, crie seguindo `.agent/schemas/dossie-intervencao.template.md`.
3. Levantamento rápido (atalho obrigatório: usar as notas antes de “caçar” evidências do zero):
   - Comece por `evidencias/indice/fase3.2-mapas-de-ligacao.md` e vá direto à seção da intervenção `I-XX`.
   - Em seguida, abra as notas-mãe relevantes (índice em `evidencias/notas/README.md`):
     - `evidencias/notas/00-nota-mae-plr.analise.md`
     - `evidencias/notas/00-nota-mae-contratos-leroy-merlin.analise.md`
     - `evidencias/notas/00-nota-mae-contratos-uniao-quimica.analise.md`
     - `evidencias/notas/00-nota-mae-quadro-custos-sap.analise.md`
     - `evidencias/notas/00-nota-mae-rescisao-travamento.analise.md`
   - Se necessário, desça para as notas por tema (pastas em `evidencias/notas/`), porque elas já trazem síntese e rastreabilidade:
     - `evidencias/notas/CONTRATOS/`, `evidencias/notas/PLR/`, `evidencias/notas/SAP/`, `evidencias/notas/ROTEIRO/`, `evidencias/notas/TABELAS/`.
   - Objetivo deste passo: obter uma lista inicial de 5–15 “candidatas a citação” (trechos) e 3–6 lacunas de viabilidade.
4. Estruture o dossiê em 2 camadas (para ficar apresentável e auditável ao mesmo tempo):
   - Camada board (corpo do dossiê): citações curtas + leitura direta (sem jargão de inventário)
   - Apêndice (no final): rastreabilidade completa (path + linhas/IDs), para auditoria
5. Escreva uma seção curta de síntese (no topo), no formato:
   - O que importa aqui (3–6 bullets)
   - O que está provado vs. o que é hipótese
6. Escreva uma `Descrição` que seja executável:
   - Explique como a intervenção funciona na prática, de ponta a ponta.
   - Inclua regra do mecanismo, governança e cadência quando aplicável.
   - Escreva com substância em prosa. Bullets podem existir, mas não podem ser a única coisa.
   - Não crie seção de “Comunicação” como padrão; mantenha o foco no mecanismo e na governança.
   - Evite parênteses no corpo do dossiê; prefira frases diretas. No apêndice, parênteses são aceitáveis quando fizerem parte do nome do arquivo.
7. Para cada evidência candidata:
   - Extraia 3–10 trechos curtos (citações) que “se sustentam sozinhos”
   - Para cada citação, escreva uma “Leitura” (1–2 linhas): o que isso prova e por que importa para a intervenção
   - Guarde a referência completa para o Apêndice (sem poluir o texto principal)
8. Classifique a força da evidência (Provado / Sustentado / Hipótese / Lacuna) e reflita isso no frontmatter (`evidence_strength`).
9. Lacunas: escreva apenas lacunas de viabilidade/execução (decisões pendentes, pré-condições, métricas e critérios de sucesso do piloto).
10. Métricas possíveis (obrigatório): preencha `Métricas possíveis` no formato:
  - métrica (nome)
  - definição operacional mínima (denominador e janela)
  - fonte provável no acervo/sistema (ex.: `evidencias/indice/tabelas/...`, SAP/folha, registro do rito)
  - observação de cautela quando não houver baseline ou quando a métrica for proxy
  - regra: não colocar meta numérica se não houver evidência; preferir “monitorar” + “critério de sucesso do piloto” em `Lacunas`.
11. Se a intervenção for de governança ou mecanismo, como mesa, rito ou processo: inclua governança executável com cadência, participantes, entradas, saídas, escalonamento e matriz de decisão.
12. Gere “Resumo executivo” (2–5 linhas) dentro do dossiê (no topo, ou na seção de força) se o usuário pedir.

## Critérios de qualidade

- O corpo do dossiê é legível para board: citações curtas + leitura direta; sem linguagem técnica de inventário.
- A seção `Descrição` explica como a intervenção funciona na prática e é executável.
- A `Descrição` tem substância em prosa, não só bullets.
- O corpo do dossiê evita parênteses e não cria seção de “Comunicação” como padrão. No apêndice, parênteses são aceitáveis.
- O dossiê mantém auditabilidade via Apêndice de rastreabilidade (path + linhas/IDs).
- Fato vs hipótese está sempre marcado.
- Lacunas são de viabilidade/execução (pré-condições, decisões pendentes, métricas, critério de sucesso do piloto).
