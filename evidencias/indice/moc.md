# Map of Content (MoC) — FASE 3.1

Objetivo: registrar, por fonte, os arquivos de evidência, com resumo breve e vínculo explícito a perguntas/intervenções para alimentar a matriz Evidências→Intervenções (FASE 4).

## Status rápido
- Banco (submissions_normalized.json / answers.json): lido parcialmente; principais respostas e anexos mapeados.
- Blobs (Netlify, store `evidence-files` / site `relatoriosdx`): baixados; leitura detalhada feita (XLSX→CSV; PDFs de cargo→JSON via Gemini).
- PDFs (e-mail): inseridos em `../pdfs/` e indexados (resumos inseridos; revisar e enriquecer conforme necessário).

## Banco (Postgres → submissions_normalized.json / answers.json)
Submissão principal `b6495e4d-3278-47a5-8ab8-a069fe99c6f5` (unit_slug=general, cycle=2026-Q1). Campos relevantes:

| Field ID | Pergunta | Resumo da resposta | Intervenção(ões) alvo |
|---|---|---|---|
| question_0 | Qual é a descrição formal de cada cargo (CBO) utilizado nas unidades? | Respondeu "Sodexo. net" + anexo ZIP com descrições de cargo. | I-24, I-25, I-31 |
| question_1 | Existe diferença salarial entre cargos nominalmente iguais em unidades diferentes? | "Sim." | I-35 |
| question_10 | Margem de Manobra financeira da GU | "Não há autonomia..." sem verba livre. | I-19, I-22 |
| question_11 | Valor total dos contratos (Leroy/União Química) | "Contrato enviado por e-mail." | I-03, I-04 |
| question_12 | Margem bruta (GM) meta e quem define | "PFP e premissa..." (Helena/J. Vieceli) | I-27 |
| question_13 | Quantas vezes atingiu GM em 12 meses | "Poliana" (referência de contato) | I-27 |
| question_14 | Ponto de equilíbrio refeições/m² | "Contrato enviado por e-mail." | I-03, I-04, I-21 |

## Índice por seção do roteiro (leitura rápida)

### Operacional

- Tabelas derivadas:
  - `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md` (A. Quadro de Pessoal e Salários)
  - `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_1.md` (B. Custos Operacionais e Insumos)
  - `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md` (C. Faturamento e Margem de Lucro)

Inventário detalhado dos blobs (paths + `submission_id` + `field_id` + `blob_key` + versões): `inventario-blobs-detalhado.md`

Anexos desta submissão (lista simples; detalhes no inventário):

| Arquivo |
|---|
| Base Frontline - Experimento.xlsx |
| Tabela Salarial - Frontline Experimento.xlsx |
| Planilha simulação aviso prévio indenizado.xlsx |
| REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf |
| Descrição de cargo Frontline. FY26 (zip) |
| FOLHA GERAL COLABORADORES JAN 2026.pdf |
| Geral - Contratados por Centro de Custo.PDF |
| Dados SAP Budget FY25 - FY26.xlsx |
| Dados SAP Real Jan25-Dez25.xlsx |
| Dados SAP Real x Budget EPI e Unif FY25.xlsx |
| Relatórios de cardápio (JAN 26 — 307 Caseira Almoço) |

Observação: mais duas submissões antigas (`6d9f5d94-7ec5-4127-935b-9a3707b37849` etc.) possuem respostas de tabela (quantidades por cargo). Priorizar leitura se necessário para volume/quadros.

Detalhes (blobs processados + extrações Gemini): ver `inventario-blobs-detalhado.md`.

## Quadro e salários (blobs)

Observação: estes PDFs existem como blobs do formulário, mas ainda não há texto extraído (`.pdf.txt`) no repositório; por enquanto, as notas abaixo registram rastreabilidade e marcam a lacuna técnica.

- FOLHA GERAL COLABORADORES (JAN/2026):
  - PDF (blob): `../blobs/FOLHA GERAL COLABORADORES JAN 2026.pdf`
  - Nota analítica: `../notas/QUADRO_E_SALARIOS/folha-geral-colaboradores-jan-2026.analise.md`
- Geral - Contratados por Centro de Custo:
  - PDF (blob): `../blobs/Geral - Contratados por Centro de Custo.PDF`
  - Nota analítica: `../notas/QUADRO_E_SALARIOS/contratados-por-centro-de-custo.analise.md`

## SAP (blobs → CSV)

Observação: os arquivos SAP foram convertidos para CSV (1 por aba/unidade) e podem ser usados como base auditável para `I-21` (quadro por demanda) e para discussão de orçamento/verba protegida (`I-19/I-22`).

- Leroy Merlin Cajamar — Real (Jan/25–Dez/25 + Jan/26):
  - CSV: `../blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR014545_LEROY_MERLIN_CAJAMAR.csv`
  - Nota analítica: `../notas/SAP/sap-leroy-merlin-cajamar-real-jan25-dez25.analise.md`
- Leroy Merlin Cajamar — Budget (FY25–FY26):
  - CSV: `../blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR014545_LEROY_MERLIN_CAJAMAR.csv`
  - Nota analítica: `../notas/SAP/sap-leroy-merlin-cajamar-budget-fy25-fy26.analise.md`
- Leroy Merlin Cajamar — Real vs Budget (EPI/Uniformes, FY25):
  - CSV: `../blobs/csv/sap/Dados_SAP_Real_x_Budget_EPI_e_Unif_FY25/BR014545_LEROY_MERLIN_CAJAMAR.csv`
  - Nota analítica: `../notas/SAP/sap-leroy-merlin-cajamar-epi-uniformes-real-vs-budget-fy25.analise.md`
- INOVAT — Real (Jan/25–Dez/25 + Jan/26):
  - CSV: `../blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR012302_INOVAT.csv`
  - Nota analítica: `../notas/SAP/sap-inovat-real-jan25-dez25.analise.md`
- INOVAT — Budget (FY25–FY26):
  - CSV: `../blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR012302_INOVAT.csv`
  - Nota analítica: `../notas/SAP/sap-inovat-budget-fy25-fy26.analise.md`

## PDFs (e-mail)

Observação: estes arquivos não têm `submission_id`/`field_id` do formulário (origem externa). A rastreabilidade aqui é por **contrato/unidade/tema** e depois será conectada às perguntas/intervenções na matriz (FASE 4).

| Arquivo | Local | Unidade/Contrato | Tema | Vínculo a perguntas/intervenções (placeholder) | Resumo |
|---|---|---|---|---|---|
| Leroy Merlin_Food_Proposta + CG - (2019) assinada.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019) assinada.pdf` | Leroy Merlin (Cajamar) | Proposta/condições gerais | question_11/question_14 + I-03, I-04, I-21 | Proposta técnica/comercial (25/04/2019) para fornecimento de alimentação; define escopo e condições gerais (base contratual inicial). Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-proposta-cg-2019.analise.md` |
| Leroy Merlin_Food_Proposta + CG - (2019).pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019).pdf` | Leroy Merlin (Cajamar) | Proposta/condições gerais | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta técnica/comercial (25/04/2019) para fornecimento de alimentação; documento identifica cliente e natureza da contratação (base para condições/escopo). Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-proposta-cg-2019.analise.md` |
| Leroy Merlin_Food_Proposta - (2020) assinada.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf` | Leroy Merlin (Cajamar) | Proposta | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta técnica e comercial (17/03/2020) para fornecimento de alimentação; versão assinada via DocuSign (prova de formalização e baseline do contrato L0037501 citado em aditivo). Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-proposta-2020.analise.md` |
| Leroy Merlin_Food_4º Aditivo - (2023) assinado.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_4º Aditivo - (2023) assinado.pdf` | Leroy Merlin (Cajamar) | Aditivo contratual | question_11/question_14 + I-03, I-04, I-21 | 4º Termo Aditivo ao Contrato de Fornecimento de Refeições nº **0037501**: contrato base assinado em **25/03/2020**; formaliza **reajuste vigente desde maio/2022 de 10%** e faturamento retroativo desde maio/2022 de **R$ 161.264,82** (parcelado; p.ex. **Agosto/2022 R$ 66.609,47**, **Setembro/2022 R$ 23.332,57**, **Outubro/2022 R$ 23.774,26**). Inclui anexos: proposta (01/09/2022), carta de reajuste (10/08/2022) e planilha de cálculo. Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-4-aditivo-2023.analise.md` |
| Leroy Merlin_Food_6º Aditivo - (2024) assinado.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_6º Aditivo - (2024) assinado.pdf` | Leroy Merlin (Cajamar) | Aditivo contratual | question_11/question_14 + I-03, I-04, I-21 | Evidência: “6º Aditivo ao Contrato nº L0037501” (27/11/2024) menciona contrato base (01/05/2020), reajuste de preço (base maio/2024) e prorrogação por 12 meses (01/05/2025–01/05/2026), com efeitos retroativos a 01/05/2024. Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-6-aditivo-2024.analise.md` |
| Leroy Merlin_Food_Proposta - (2024).pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2024).pdf` | Leroy Merlin (Cajamar) | Proposta | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta comercial 2024 (texto extraível parcial) — usar para confirmar reajustes/escopo citados nos aditivos e conectar a break-even (question_14). Nota analítica: `../notas/CONTRATOS/leroy-merlin-food-proposta-reajuste-2024.analise.md` |
| União Química_Contrato_Food - (2016)_assinado.pdf | `../pdfs/União Química/União Química_Contrato_Food - (2016)_assinado.pdf` | União Química (Guarulhos Food) | Contrato | question_11/question_14 + I-03, I-21 | Contrato base 05/10/2016 (fornecimento de refeições) — usar para cláusulas de escopo e responsabilidades; revisar para condições financeiras originais. Nota analítica: `../notas/CONTRATOS/uniao-quimica-food-contrato-2016.analise.md` |
| União Química_Proposta Comercial_Food  - (2018)_assinada.pdf | `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2018)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Proposta comercial 2018 (texto OCR ruidoso) — precisa refinamento/OCR adicional para extrair preços/escopo; marca como base para evolução contratual. Nota analítica: `../notas/CONTRATOS/uniao-quimica-food-proposta-2018.analise.md` |
| União Química_Proposta Comercial_Food  - (2019)_assinada.pdf | `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2019)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Proposta com matriz de escopo/responsabilidades (itens de infraestrutura/insumos): menciona custos e responsabilidades sobre **água potável/água mineral (com laudo)**, **instalação/manutenção de filtros**, **fornecimento de gás-insumo**, **vapor/energia elétrica** e itens correlatos. Texto ainda parcialmente ruidoso, mas já evidencia divisão de responsabilidades operacionais que afeta custo base (break-even). Nota analítica: `../notas/CONTRATOS/uniao-quimica-food-proposta-2019.analise.md` |
| União Química_Aditivo_Food - (2020)_assinado.pdf | `../pdfs/União Química/União Química_Aditivo_Food - (2020)_assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Aditivo 2020: altera padrão contratual conforme nova proposta, prorroga vigência +36 meses (até 03/02/2023), muda vencimento para **90 dias** com pagamentos em agosto/janeiro, mínima apurada **trimestralmente**; inclui unidades Brasília, Pouso Alegre, São Paulo. Nota analítica: `../notas/CONTRATOS/uniao-quimica-food-aditivo-2020.analise.md` |
| Contrato FM Assinado 2021.pdf | `../pdfs/União Química/Contrato FM Assinado 2021.pdf` | União Química (Guarulhos FM) | Contrato FM | question_11/question_14 + I-03, I-21 | Evidência: condições gerais de prestação de serviços detalham obrigações das partes (responsabilidade trabalhista, fiscalização) e termos financeiros (pagamento conforme proposta; faturamento no dia 06; vencimento 90 DDL; prazo de aceite 3 dias úteis). Nota analítica: `../notas/CONTRATOS/uniao-quimica-fm-contrato-2021.analise.md` |
| INOVAT_Aditivo Food - (2022) - assinado.pdf | `../pdfs/União Química/INOVAT_Aditivo Food - (2022) - assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Evidência: aditivo contratual (texto extraível) — usar para identificar mudanças de escopo/preço/prazos e conectar com capacidade operacional e base de budget (question_11/question_14). Nota analítica: `../notas/CONTRATOS/inovat-uniao-quimica-food-2-aditivo-2022.analise.md` |
| F & F_Proposta Comercial_Food - (2022)_assinada.pdf | `../pdfs/União Química/F & F_Proposta Comercial_Food - (2022)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Evidência: proposta comercial assinada (texto extraível parcial) — útil para levantar preços/escopo e apoiar cálculo de break-even (question_14). Nota analítica: `../notas/CONTRATOS/ff-bthek-uniao-quimica-food-proposta-2022.analise.md` |
| F & F_Proposta Comercial_Food  - (2022)_assinada (Summary).pdf | `../pdfs/União Química/F & F_Proposta Comercial_Food  - (2022)_assinada (Summary).pdf` | União Química (Guarulhos Food) | Proposta (summary) | question_11/question_14 + I-03, I-21 | Evidência: sumário executivo da proposta (texto extraível) — facilita identificar rapidamente escopo e parâmetros comerciais sem percorrer o documento completo. Nota analítica: `../notas/CONTRATOS/ff-bthek-uniao-quimica-docusign-summary-2022.analise.md` |
| União Química_Aditivo_Food - (2024)_assinado.pdf | `../pdfs/União Química/União Química_Aditivo_Food - (2024)_assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Evidência: aditivo 2024 (texto extraível) — base para mapear reajuste e vigência; insumo para negociação/mesa compartilhada (I-03) e recalibração do quadro (I-21). Nota analítica: `../notas/CONTRATOS/uniao-quimica-food-4-aditivo-2024.analise.md` |
 | REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf | `../pdfs/PLR/REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` | Corporativo (FY25) | PLR gerentes | question_61 + I-26, I-27 | Evidência: documento REB_OPE_08 define objetivo e regras do programa para GU; explicita papel de Planejamento Financeiro/Controller em informar budget e GM% e define conceitos como “gatilho de pagamento” e superação de meta. Nota analítica: `../notas/PLR/REB_OPE_08_PLR_Gerente_Unidades_FY25_rev17.analise.md` |
 | REB_OPE_15_PLR_Operacional_Food_12.pdf | `../pdfs/PLR/REB_OPE_15_PLR_Operacional_Food_12.pdf` | Operação Food | PLR operacional | I-26, I-27 | Evidência: define PLR de operacionais (Food) e conceitos (GM, budget realizado x orçado); descreve elegibilidade e inclui regra de pagamento em rescisão sem justa causa após 6 meses (15% do piso) e pagamento de ciclo para rescindidos após 01/09/2025. Nota analítica: `../notas/PLR/REB_OPE_15_PLR_Operacional_Food_FY25_rev12.analise.md` |

Observação: `REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` existe como **blob** e como **PDF de e-mail**.


## Notas Analíticas Transversais (Sínteses)

- **[PLR FY26: Análise Comparativa](evidencias/notas/PLR/PLR_FY26_Analise_Comparativa.analise.md)**: Mapeamento das regras para Liderança (`REB_EMP_21`) vs Operação (`REB_OPE_15`).
- **[PLR: Análise Forense dos Deflatores](evidencias/notas/PLR/PLR_Analise_Critica_Incentivos.analise.md)**: (🔥 Crítico) Desconstrução dos incentivos perversos (Pacto de Silêncio, Limbo do Turnover, Punição Nuclear). Essencial para a defesa da I-26 e I-02.
- **Análise Crítica de Incentivos (Risco Sistêmico):** A estrutura atual de incentivos impõe um "Conflito de Agência" onde o gestor local é penalizado financeiramente por executar a estratégia da liderança (saneamento) e a operação é incentivada ao risco (ocultação de problemas).

## Próximas ações (FASE 3.1 → 4)
1) Abrir cada blob/PDF, adicionar resumo de 2–3 linhas e ligação explícita a intervenções (I-XX) nesta MoC.
2) Para respostas textuais do banco, gerar notas por pergunta (p.ex. autonomia financeira, GM, break-even) aqui ou em notas específicas.
3) Manter `inventario-geral.md` em sincronia (novos PDFs/blobs) e garantir rastreabilidade `submission_id`/`field_id` quando a origem for formulário.
4) Usar esta MoC como entrada para a matriz Evidências→Intervenções (doc 08) na FASE 4.
