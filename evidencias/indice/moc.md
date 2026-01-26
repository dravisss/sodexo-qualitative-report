# Map of Content (MoC) — FASE 3.1

Objetivo: registrar, por fonte, os arquivos de evidência, com resumo breve e vínculo explícito a perguntas/intervenções para alimentar a matriz Evidências→Intervenções (FASE 4).

## Status rápido
- Banco (submissions_normalized.json / answers.json): lido parcialmente; principais respostas e anexos mapeados.
- Blobs (Netlify, store `evidence-files` / site `relatoriosdx`): baixados; resumo inicial pelo nome/escopo (pendente leitura detalhada).
- PDFs (e-mail): inseridos em `../pdfs/` e indexados (pendente leitura detalhada).

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

Anexos desta submissão (também em `attachments.json`):

| Arquivo | Local | field_id | Fonte / Conteúdo esperado | Pergunta que responde |
|---|---|---|---|---|
| Descrição de cargo Frontline. FY26.zip | `../blobs/Descrição de cargo Frontline. FY26.zip` | question_0_file | ZIP com descrições de cargos Frontline | question_0 |
| Base Frontline - Experimento.xlsx | `../blobs/Base Frontline - Experimento.xlsx` | table_0_row_9_col_1_file & question_3_file | Base de experimento salarial/frontline (valores/linhas) | tabela salarial/experimento (pergunta de remuneração) |
| Tabela Salarial - Frontline Experimento.xlsx | `../blobs/Tabela Salarial - Frontline Experimento.xlsx` | question_4_file | Tabela salarial detalhada para experimento | remuneração (question_4) |
| Planilha simulação aviso prévio indenizado.xlsx | `../blobs/Planilha simulação aviso prévio indenizado.xlsx` | question_75_file | Simulação de aviso prévio indenizado | custo rescisório / desligamentos |
| REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf | `../blobs/REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` | question_61_file | Política/REB de PLR Gerentes FY25 | PLR/engajamento |

Observação: mais duas submissões antigas (`6d9f5d94-7ec5-4127-935b-9a3707b37849` etc.) possuem respostas de tabela (quantidades por cargo). Priorizar leitura se necessário para volume/quadros.

## Blobs (Netlify store `evidence-files`)
Resumo inicial por arquivo (pendente leitura detalhada; todos já vinculados a `submission_id`/`field_id`):

| Arquivo | field_id | submission_id | Suposição de conteúdo | Pergunta/tema | Próxima ação |
|---|---|---|---|---|---|
| Descrição de cargo Frontline. FY26.zip | question_0_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | Descrições de cargos (CBO / perfis) | question_0 — definição de cargos | Extrair e resumir perfis-chave |
| Base Frontline - Experimento.xlsx | table_0_row_9_col_1_file (e duplicado em question_3_file) | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | Base salarial/experimento frontline | tabela remuneração/experimento | Ler abas e destacar métricas GM/variações |
| Tabela Salarial - Frontline Experimento.xlsx | question_4_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | Tabela salarial consolidada | remuneração (question_4) | Extrair faixas por cargo/unidade |
| Planilha simulação aviso prévio indenizado.xlsx | question_75_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | Simulação custo aviso prévio | desligamento/custo rescisório | Calcular cenários relevantes |
| REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf | question_61_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | Política PLR Gerentes FY25 | incentivos/PLR | Extrair critérios e thresholds |

## PDFs (e-mail)

Observação: estes arquivos não têm `submission_id`/`field_id` do formulário (origem externa). A rastreabilidade aqui é por **contrato/unidade/tema** e depois será conectada às perguntas/intervenções na matriz (FASE 4).

| Arquivo | Local | Unidade/Contrato | Tema | Vínculo a perguntas/intervenções (placeholder) | Resumo |
|---|---|---|---|---|---|
| Leroy Merlin_Food_Proposta + CG - (2019) assinada.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019) assinada.pdf` | Leroy Merlin (Cajamar) | Proposta/condições gerais | question_11/question_14 + I-03, I-04, I-21 | Proposta técnica/comercial (25/04/2019) para fornecimento de alimentação; define escopo e condições gerais (base contratual inicial). |
| Leroy Merlin_Food_Proposta + CG - (2019).pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019).pdf` | Leroy Merlin (Cajamar) | Proposta/condições gerais | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta técnica/comercial (25/04/2019) para fornecimento de alimentação; documento identifica cliente e natureza da contratação (base para condições/escopo). |
| Leroy Merlin_Food_Proposta - (2020) assinada.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf` | Leroy Merlin (Cajamar) | Proposta | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta técnica e comercial (17/03/2020) para fornecimento de alimentação; versão assinada via DocuSign (prova de formalização e baseline do contrato L0037501 citado em aditivo). |
| Leroy Merlin_Food_4º Aditivo - (2023) assinado.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_4º Aditivo - (2023) assinado.pdf` | Leroy Merlin (Cajamar) | Aditivo contratual | question_11/question_14 + I-03, I-04, I-21 | Aditivo 2023 (conteúdo OCR) — revisar para percentuais/vigência exatos; provável reajuste e prorrogação ligados ao contrato L0037501. |
| Leroy Merlin_Food_6º Aditivo - (2024) assinado.pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_6º Aditivo - (2024) assinado.pdf` | Leroy Merlin (Cajamar) | Aditivo contratual | question_11/question_14 + I-03, I-04, I-21 | Evidência: “6º Aditivo ao Contrato nº L0037501” (27/11/2024) menciona contrato base (01/05/2020), reajuste de preço (base maio/2024) e prorrogação por 12 meses (01/05/2025–01/05/2026), com efeitos retroativos a 01/05/2024. |
| Leroy Merlin_Food_Proposta - (2024).pdf | `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2024).pdf` | Leroy Merlin (Cajamar) | Proposta | question_11/question_14 + I-03, I-04, I-21 | Evidência: proposta comercial 2024 (texto extraído parcial) — usar para confirmar reajustes/escopo citados nos aditivos e conectar a break-even (question_14). |
| União Química_Contrato_Food - (2016)_assinado.pdf | `../pdfs/União Química/União Química_Contrato_Food - (2016)_assinado.pdf` | União Química (Guarulhos Food) | Contrato | question_11/question_14 + I-03, I-21 | Contrato base 05/10/2016 (fornecimento de refeições) — usar para cláusulas de escopo e responsabilidades; revisar para condições financeiras originais. |
| União Química_Proposta Comercial_Food  - (2018)_assinada.pdf | `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2018)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Proposta comercial 2018 (texto OCR ruidoso) — precisa refinamento/OCR adicional para extrair preços/escopo; marca como base para evolução contratual. |
| União Química_Proposta Comercial_Food  - (2019)_assinada.pdf | `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2019)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Proposta comercial 2019 (OCR parcial, texto mínimo) — exige nova passada/limpeza para capturar valores e escopo. |
| União Química_Aditivo_Food - (2020)_assinado.pdf | `../pdfs/União Química/União Química_Aditivo_Food - (2020)_assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Aditivo 2020: altera padrão contratual conforme nova proposta, prorroga vigência +36 meses (até 03/02/2023), muda vencimento para **90 dias** com pagamentos em agosto/janeiro, mínima apurada **trimestralmente**; inclui unidades Brasília, Pouso Alegre, São Paulo. |
| Contrato FM Assinado 2021.pdf | `../pdfs/União Química/Contrato FM Assinado 2021.pdf` | União Química (Guarulhos FM) | Contrato FM | question_11/question_14 + I-03, I-21 | Evidência: condições gerais de prestação de serviços detalham obrigações das partes (responsabilidade trabalhista, fiscalização) e termos financeiros (pagamento conforme proposta; faturamento no dia 06; vencimento 90 DDL; prazo de aceite 3 dias úteis). |
| INOVAT_Aditivo Food - (2022) - assinado.pdf | `../pdfs/União Química/INOVAT_Aditivo Food - (2022) - assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Evidência: aditivo contratual (texto extraível) — usar para identificar mudanças de escopo/preço/prazos e conectar com capacidade operacional e base de budget (question_11/question_14). |
| F & F_Proposta Comercial_Food - (2022)_assinada.pdf | `../pdfs/União Química/F & F_Proposta Comercial_Food - (2022)_assinada.pdf` | União Química (Guarulhos Food) | Proposta comercial | question_11/question_14 + I-03, I-21 | Evidência: proposta comercial assinada (texto extraível parcial) — útil para levantar preços/escopo e apoiar cálculo de break-even (question_14). |
| F & F_Proposta Comercial_Food  - (2022)_assinada (Summary).pdf | `../pdfs/União Química/F & F_Proposta Comercial_Food  - (2022)_assinada (Summary).pdf` | União Química (Guarulhos Food) | Proposta (summary) | question_11/question_14 + I-03, I-21 | Evidência: sumário executivo da proposta (texto extraível) — facilita identificar rapidamente escopo e parâmetros comerciais sem percorrer o documento completo. |
| União Química_Aditivo_Food - (2024)_assinado.pdf | `../pdfs/União Química/União Química_Aditivo_Food - (2024)_assinado.pdf` | União Química (Guarulhos Food) | Aditivo contratual | question_11/question_14 + I-03, I-21 | Evidência: aditivo 2024 (texto extraível) — base para mapear reajuste e vigência; insumo para negociação/mesa compartilhada (I-03) e recalibração do quadro (I-21). |
| REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf | `../pdfs/PLR/REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` | Corporativo (FY25) | PLR gerentes | question_61 + I-26, I-27 | Evidência: documento REB_OPE_08 define objetivo e regras do programa para GU; explicita papel de Planejamento Financeiro/Controller em informar budget e GM% e define conceitos como “gatilho de pagamento” e superação de meta. |
| REB_OPE_15_PLR_Operacional_Food_12.pdf | `../pdfs/PLR/REB_OPE_15_PLR_Operacional_Food_12.pdf` | Operação Food | PLR operacional | I-26, I-27 | Evidência: define PLR de operacionais (Food) e conceitos (GM, budget realizado x orçado); descreve elegibilidade e inclui regra de pagamento em rescisão sem justa causa após 6 meses (15% do piso) e pagamento de ciclo para rescindidos após 01/09/2025. |

Observação: `REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` existe como **blob** e como **PDF de e-mail**.

## Próximas ações (FASE 3.1 → 4)
1) Abrir cada blob/PDF, adicionar resumo de 2–3 linhas e ligação explícita a intervenções (I-XX) nesta MoC.
2) Para respostas textuais do banco, gerar notas por pergunta (p.ex. autonomia financeira, GM, break-even) aqui ou em notas específicas.
3) Manter `inventario-geral.md` em sincronia (novos PDFs/blobs) e garantir rastreabilidade `submission_id`/`field_id` quando a origem for formulário.
4) Usar esta MoC como entrada para a matriz Evidências→Intervenções (doc 08) na FASE 4.
