# Argumentário — I-20 — Provisionamento Orçamentário de Rescisão (Budget Operacional)

## Tese (o que defender)

Criar conta centralizada para absorver demissões estruturais aprovadas (limite de X% do quadro/ano). A unidade paga o salário corrente, mas o "custo de morte" (rescisão) é assumido pela matriz para sanear a operação.

## O que os dados provam

- **Custo Proibitivo:** Simulações de desligamento de veteranos (5-15 anos) mostram impacto entre R$ 17k e R$ 28k por CPF (`evidencias/blobs/csv/Simulação Aviso Prévio Indenizado.csv` linhas 2-3).
- **Mecânica de Travamento:** O diagnóstico qualitativo descreve o travamento como um equilíbrio estável produzido por incentivos e restrições (`Refined/03-analise-gestao-pessoas-travamento-rescisorio.md` linhas 32-39).
- **Modelo Existente:** A empresa já possui uma estrutura granular de decomposição de custos rescisórios, facilitando a parametrização do fundo (`evidencias/blobs/csv/Simulação Aviso Prévio Indenizado.csv` linha 1).

- **Débito 100% no centro de custo:** Confirmação explícita de que verbas rescisórias são debitadas 100% no centro de custo da unidade (`evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `6f3c38e8-2301-43bb-a152-92d812f8fd38`; field_id `question_74`).

- **Custo médio / simulação anexa:** A própria resposta do formulário remete ao exemplo anexo para custo médio, que conecta o CSV ao banco (`evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `c4e4fff5-b3e8-4f0e-b046-364604e3f7f2`; field_id `question_75`).

- **Implicação sindical:** Indicação de que a criação do fundo não tem implicação sindical, reduzindo um risco de contestação no mecanismo (`evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `30a44184-6218-4686-bb7e-911bad6c28b0`; field_id `question_38`).

## O que os dados sugerem (mas não provam)

- A alta taxa de absenteísmo pode ser, em parte, composta por colaboradores "forçando a demissão" para acessar o saldo de FGTS sem perder direitos.
- A "imunidade sistêmica" observada em experimentos anteriores (CoP 2024) decorreu da permanência de núcleos de resistência que não puderam ser desligados pelo custo.

## O que falta validar (lacunas)

- Distribuição real de tempo de casa nas unidades críticas (Cajamar/Guarulhos) para projetar o aporte inicial do fundo.
- Regra de transição contábil: como o fundo será alimentado (ex: taxa mensal sobre a folha).

## Objeções prováveis (board / jurídico / cliente)

- **"O fundo vai incentivar a rotatividade descontrolada."**
- **"Isso é custo adicional que não estava no budget."**

## Respostas (com base em evidências)

- **Resposta à rotatividade:** O uso do fundo é restrito a "Desligamentos Estratégicos" aprovados pelo RH/GO e limitado a 10% do headcount/ano.
- **Resposta ao custo:** O custo da improdutividade (R$ 1k/mês por funcionário travado) é superior ao custo da rescisão diluído no tempo. A renovação reduz horas extras e melhora a qualidade percebida pelo cliente.

## Viabilidade prática

- **Execução (recursos/rotina):** Fluxo de aprovação via Workflow de RH.
- **Governança (quem decide/mede):** RH Corporativo + Diretoria de Operações.
- **Custo (capex/opex):** Realocação de budget. O custo total de rescisão já é pago pela empresa; o fundo apenas muda o local do débito para não travar a operação.
- **Dependências (cliente/contrato):** Nenhuma direta; decisão interna de gestão financeira.

## Riscos e efeitos colaterais

- **Seleção Adversa Interna:** O fundo pode ser usado para "livrar-se" de problemas de gestão em vez de problemas de perfil. Exige auditoria de motivos de desligamento.

## Checagem S1 (âncoras e força)

- Âncoras **Provado** (2):
  - Verbas rescisórias debitadas 100% no centro de custo da unidade.
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `6f3c38e8-2301-43bb-a152-92d812f8fd38`; field_id `question_74`.
  - Simulação de rescisão indica ordem de grandeza de custo (5 anos vs 15 anos).
    - `evidencias/blobs/csv/Simulação Aviso Prévio Indenizado.csv`, linhas 2–3.

- Âncoras **Sustentado qualitativamente** (2):
  - Travamento rescisório descrito como equilíbrio estável produzido por incentivos e restrições.
    - `Refined/03-analise-gestao-pessoas-travamento-rescisorio.md`, linhas 32–39.
  - Baixo risco de contestação sindical explícita para criação do fundo.
    - `evidencias/banco/answers.json` — submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_id `30a44184-6218-4686-bb7e-911bad6c28b0`; field_id `question_38`.

## Referências principais

- `evidencias/blobs/csv/Simulação Aviso Prévio Indenizado.csv` (linhas 1–3)
- `Refined/03-analise-gestao-pessoas-travamento-rescisorio.md` (linhas 32–39)
- `evidencias/banco/answers.json` (submission_id `b6495e4d-3278-47a5-8ab8-a069fe99c6f5`; answer_ids `6f3c38e8-2301-43bb-a152-92d812f8fd38`, `c4e4fff5-b3e8-4f0e-b046-364604e3f7f2`, `30a44184-6218-4686-bb7e-911bad6c28b0`)
- `intervencoes/I-19-verba-corporativa-para-renovacao-de-equipe.md` (apêndice de rastreabilidade)
