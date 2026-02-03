# .agent

Este diretório contém um “sistema agêntico” leve para manter consistência entre conversas e acelerar as fases de análise e consolidação (Fases 4–6).

## Como usar (modo prático)

- Para iniciar uma conversa nova, cole (ou referencie) `ORCHESTRATOR.md` como instrução base.
- Use os workflows em `.agent/workflows/` como “checklists executáveis” (você pode pedir: “rode o workflow X”).
- Use as skills em `.agent/skills/` como “comandos” (você pode pedir: “aplique a skill X no arquivo Y”).

## Convenções do projeto que este sistema assume

- A fonte de verdade do diagnóstico/estrutura está em `overview.md`.
- A Fase 4 está definida em `plan-investigacao.md`.
- Evidências vivem em `evidencias/` (banco, blobs, pdfs e índice/MoC).
- Dossiês por intervenção vivem em `intervencoes/` (1 arquivo por `I-XX`).

## Memória operacional (anti-reinício)

- Use `STATUS.md` para registrar:
  - fase atual
  - intervenções priorizadas
  - evidências pendentes
  - decisões e backlog

## Padrão de rastreabilidade (obrigatório)

Toda afirmação relevante deve apontar para pelo menos um destes:

- `evidencias/indice/moc.md` (quando for um resumo indexado)
- `evidencias/banco/...` (ex.: `submissions_normalized.json`, com `submission_id` e campos)
- `evidencias/pdfs/...` (caminho + trecho)
- `evidencias/blobs/...` (arquivo local + `blob_key` quando existir)

## Perguntas de calibração (responda quando quiser)

- Quais intervenções (I-XX) são **prioridade** na Fase 4: risco jurídico, risco contratual, custo humano, ou viabilidade rápida?
- Você quer que o padrão do dossiê seja mais “executivo” (1 página) ou mais “jurídico/auditável” (com citações longas)?
- A matriz consolidada deve priorizar: impacto esperado, risco mitigado, custo/complexidade, ou evidência disponível?
- Você quer que eu seja mais “promotor” (argumentar a favor) ou mais “auditor cético” (tentar refutar)?
- Qual é o seu limiar de evidência para marcar algo como:
  - Provado
  - Sustentado qualitativamente
  - Hipótese
  - Lacuna

## Arquivos principais

- `ORCHESTRATOR.md`: instrução-mãe (cérebro do projeto)
- `STATUS.md`: memória operacional (estado do trabalho)
- `workflows/`: rotinas repetíveis
- `skills/`: técnicas pontuais acionáveis
- `schemas/`: formatos e templates estruturados

## O que existe para cada fase

### Fase 4 — Dossiês e matriz (fonte de verdade)

- Workflows:
  - `workflows/fase4-dossie-por-intervencao.md`
  - `workflows/indexar-evidencia-no-moc.md`
  - `workflows/gerar-matriz-a-partir-dossies.md`
  - `workflows/auditoria-consistencia-dossies.md`

### Fase 5 — Argumentário, contrato, ROI e visualizações

- Templates:
  - `schemas/argumentario-intervencao.template.md`
  - `schemas/analise-contratual.template.md`
  - `schemas/visualizacao-spec.template.md`
- Workflows:
  - `workflows/fase5-argumentario-por-intervencao.md`
  - `workflows/fase5-analise-contratual.md`
  - `workflows/fase5-proposta-visualizacoes.md`
- Skills:
  - `skills/gerar-argumentario-executivo.md`
  - `skills/estimativa-custo-evitado.md`
  - `skills/triagem-priorizacao-intervencoes.md`

### Fase 6 — Checagem final e entregáveis

- Workflow:
  - `workflows/fase6-checagem-final-entregaveis.md`
