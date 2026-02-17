# I-20 — Provisionamento Orçamentário de Rescisão (Budget Operacional)

## Identificação

## Tese (o que defender)

Remover o "Veto Contábil" à gestão de pessoas, centralizando o custo rescisório (multas e encargos) em um fundo corporativo ("Bad Bank" de RH), permitindo que o gestor local demita baseado em critérios técnicos (competência/fit) sem implodir o P&L da unidade no mês da decisão.

- Intervenção: `I-17`
- Unidade(s): Cajamar | Guarulhos Food | Guarulhos FM | Transversal
- Frente: Reestruturação

## O que importa aqui

- O custo de rescisão é debitado diretamente no P&L local, o que vira um veto invisível a desligamentos necessários, mantendo pessoas desengajadas por meses ou anos.
- Este "travamento rescisório" gera um custo invisível de produtividade: paga-se 100% do salário para quem entrega 50% ou menos, além de contaminar o clima dos que permanecem produtivos.
- A intervenção propõe um fundo centralizado que absorve o impacto imediato da rescisão, permitindo que a liderança local tome decisões baseadas em fit técnico e engajamento, não em saldo de caixa do mês.

## O que está provado vs. o que é hipótese

- Provado:
  - Existe um modelo de decomposição de custo rescisório que inclui verbas "não provisionadas" que impactam o resultado local.
  - Simulações internas mostram que uma rescisão de colaborador veterano (5 a 15 anos) pode custar entre R$ 17k e R$ 28k (para salário de R$ 2k).
  - O campo registra que a empresa não demite pelo custo e o funcionário não pede conta para não perder o FGTS.
- Hipótese (a validar em execução):
  - A centralização do custo rescisório em um fundo corporativo reduz a retenção forçada e aumenta a produtividade média da unidade em 15% após 6 meses de renovação.

## Tensão / Objetivo / Impacto (doc 08)

- Tensão: O P&L da unidade pune a correção de rumo. O gerente sabe que precisa demitir o funcionário tóxico, mas se o fizer, perde sua meta financeiro no mês. Resultado: paga para manter o problema.
- Descrição: Criar conta centralizada para absorver demissões estruturais aprovadas (limite de X% do quadro/ano). A unidade paga o salário corrente, mas o "custo de morte" (rescisão) é assumido pela matriz para sanear a operação.
- Objetivo: Remover a barreira financeira que impede a gerência local de renovar sua equipe.
- Impacto: Se demitir não custa o bônus do gerente, a renovação saudável da equipe acontece, quebrando o ciclo de retenção de profissionais insatisfeitos.

## Descrição (doc 08, com adaptações)

O mecanismo foca em desvincular a "decisão de gestão" da "capacidade de caixa local".

Como funciona:

- Criação de uma conta centralizada de "Fundo de Renovação".
- A GU submete casos de desligamento estratégico (ex: baixo fit crônico, desejo manifesto de saída, performance abaixo de 50%).
- Uma vez aprovado pelo RH/Operações, o custo da multa do FGTS e verbas não provisionadas é debitado do fundo central, não do GM da unidade.
- Regra de Uso: Limite de uso do fundo por contrato/ano (ex: renovação de até 10% do headcount/ano) para evitar "farra de demissões".

## Evidências (citações + leitura)

### Evidência 1 — Simulação de custo para "Colaborador 5 anos" (salário R$ 2.000)

> "Colaborador 5 anos,2000,22/01/2021,01/02/2026,18/03/2026, ... Total 17237,64"

Leitura:
- Uma única demissão de veterano consome R$ 17k de margem imediata. Para uma unidade pequena, isso pode representar o lucro de um mês inteiro, tornando a demissão proibitiva para o gestor local.

### Evidência 2 — O impasse do equilíbrio de Nash negativo

> "A empresa não demite (porque o custo sai da margem); o trabalhador não pede demissão (porque perde direitos). Ambos estão 'presos' em uma configuração que nenhum dos dois escolheu."

Leitura:
- O diagnóstico qualitativo confirma que o modelo contábil atual produz um comportamento defensivo de ambas as partes, resultando em ineficiência sistêmica.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: O custo financeiro é provado via planilhas de simulação. O comportamento de travamento é sustentado por múltiplos relatos de campo. A eficácia do fundo depende de governança corporativa.

## Lacunas (viabilidade/execução)

- Definir a origem do capital para o fundo inicial (aporte corporativo vs taxa mensal por unidade).
- Definir SLA de aprovação de uso do fundo (quem valida o "caráter estratégico" da demissão).
- Mapear o impacto de longo prazo na multa de 40% do FGTS (passivo acumulado).

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: Taxa de turnover involuntário (desbloqueado) vs. queda de turnover voluntário após 6 meses; janela semestral.
- Absenteísmo / INSS:
  - Definição operacional mínima: Redução de afastamentos prolongados por "doenças de travamento" (psicossociais); janela anual.
- Operação/qualidade:
  - Definição operacional mínima: Produtividade por FTE (refeições/homem-hora) antes e depois da renovação; janela trimestral.

## Riscos / Pré-condições

- Risco: Uso indiscriminado do fundo para punições disciplinares comuns que deveriam ser geridas por processo normal.
- Pré-condição: Orçamento corporativo aprovado e sistema contábil capaz de isolar o custo da unidade.

## Próximos passos (Fase 4 → 5)

- Simular o custo de renovar 5% do headcount das unidades de Cajamar e Guarulhos.
- Elaborar a política de "Saída Honrosa" vinculada ao uso do fundo.

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: CSV de simulação de rescisão
  - referência completa: `evidencias/blobs/csv/Simulação Aviso Prévio Indenizado.csv` linha 2.
- Evidência 2:
  - fonte: Análise de Gestão de Pessoas (Refined)
  - referência completa: `Refined/03-analise-gestao-pessoas-travamento-rescisorio.md` linhas 37-39.

- Evidência 3:
  - fonte: Banco (formulário) — débito 100% no centro de custo
  - referência completa (submission_id + answer_id + field_id):
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `6f3c38e8-2301-43bb-a152-92d812f8fd38`; field_id `question_74`.

- Evidência 4:
  - fonte: Banco (formulário) — existência de mecanismo de provisão/reserva (parcial)
  - referência completa (submission_id + answer_id + field_id):
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `e9b85ae4-7eff-4ac1-a610-4cc5dfa853ba`; field_id `question_76`.

- Evidência 5:
  - fonte: Banco (formulário) — custo médio / simulação anexa como evidência institucional
  - referência completa (submission_id + answer_id + field_id):
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `c4e4fff5-b3e8-4f0e-b046-364604e3f7f2`; field_id `question_75`.

- Evidência 6:
  - fonte: Banco (formulário) — implicação sindical do fundo
  - referência completa (submission_id + answer_id + field_id):
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `30a44184-6218-4686-bb7e-911bad6c28b0`; field_id `question_38`.
