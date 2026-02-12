# Argumentário — I-29 — SLA de Atendimento para Solicitações de RH

## Tese (o que defender)

Fila Única RH com SLA por criticidade: Crítico (folha/rescisão) = 3 dias úteis, Normal (férias/benefícios) = 7 dias, Rotina (dúvidas) = 15 dias. Escalonamento automático: atraso >48h = alerta ao BP, >5 dias = escala RH regional. Evidência de fechamento obrigatória (print/protocolo).

## O que os dados provam

- Há resposta do banco afirmando que os chamados são resolvidos em até 3 dias (indicando capacidade/intenções atuais).

## O que os dados sugerem (mas não provam)

- Sem fila única e regra de escalonamento, o SLA vira promessa e aumenta frustração.

## O que falta validar (lacunas)

- Baseline real: tempo de resposta por tipo.
- Backlog real.
- Tipos elegíveis e níveis de criticidade.

## Objeções prováveis (board / jurídico / cliente)

- “SLA sem capacidade vira tiro no pé”.

## Respostas (com base em evidências)

- O roteiro já mapeia explicitamente a lacuna de baseline/backlog. O piloto deve começar medindo antes de “prometer prazo”.

## Viabilidade prática

- Execução (recursos/rotina):
  - Canal único e triagem diária.
  - Ticket com evidência de conclusão.
- Governança (quem decide/mede):
  - RH/DP com escalonamento.
- Custo (capex/opex):
  - Baixo; pode exigir ajuste de processos.
- Dependências (cliente/contrato):
  - Nenhuma direta.

## Riscos e efeitos colaterais

- Se não houver escalonamento, vira estatística sem consequência.

## Checagem S1 (âncoras e força)

- Âncoras **Provado** (1):
  - Resposta do banco sobre prazo de resolução (3 dias).
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `0b7c744d-9a4f-40d4-958a-3969a8f7a987`; field_id `question_25`.
- Âncoras **Sustentado qualitativamente** (1):
  - Lacuna explícita de baseline/backlog como pré-condição.
    - `evidencias/notas/ROTEIRO/due-diligence-operacional/F-processos-e-escalas.analise.md`, linhas 15–18.

## Referências principais

- `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `0b7c744d-9a4f-40d4-958a-3969a8f7a987`; field_id `question_25`.
- `evidencias/notas/ROTEIRO/due-diligence-operacional/F-processos-e-escalas.analise.md`, linhas 15–18.
- `intervencoes/I-29-sla-de-atendimento-para-solicitacoes-de-rh.md` (apêndice de rastreabilidade)
