# Inventário Geral — Evidências (Cajamar e Guarulhos)

## Objetivo

Consolidar, em um único lugar, **todas as evidências disponíveis** (banco, blobs e PDFs) e permitir rastreabilidade até:

- Unidade (Cajamar, Guarulhos Food, Guarulhos FM)
- Fonte (banco, blob, e-mail)
- Campo/pergunta do roteiro (field_id / question_text)
- Intervenções potenciais (I-XX)

## Inventários existentes

- **Banco**: `inventario-banco.md`

## Blobs baixados

| Arquivo local | Origem | unit_slug | submission_id | field_id | blob_key |
|---|---|---|---|---|---|
| `../blobs/Menu_de_Experimentos.csv` | Netlify Blobs | cajamar | 67305793-b608-43c8-ad39-196f2aefd8c9 | table_0_row_9_col_1_file | 67305793-b608-43c8-ad39-196f2aefd8c9/table_0_row_9_col_1_file/1768670316985_Menu_de_Experimentos.csv |
| `../blobs/Descrição de cargo Frontline. FY26.zip` | Netlify Blobs (relatoriosdx) | general | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | question_0_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5/question_0_file/1769017172677_Descri__o_de_cargo_Frontline._FY26.zip |
| `../blobs/Base Frontline - Experimento.xlsx` | Netlify Blobs (relatoriosdx) | general | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | table_0_row_9_col_1_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0_row_9_col_1_file/1769017249113_Base_Frontline_-_Experimento.xlsx |
| `../blobs/Tabela Salarial - Frontline Experimento.xlsx` | Netlify Blobs (relatoriosdx) | general | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | question_4_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5/question_4_file/1769019648907_Tabela_Salarial_-_Frontline_Experimento.xlsx |
| `../blobs/Planilha simulação aviso prévio indenizado.xlsx` | Netlify Blobs (relatoriosdx) | general | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | question_75_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5/question_75_file/1769108567016_Planilha_simula__o_aviso_pr_vio_indenizado.xlsx |
| `../blobs/REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` | Netlify Blobs (relatoriosdx) | general | b6495e4d-3278-47a5-8ab8-a069fe99c6f5 | question_61_file | b6495e4d-3278-47a5-8ab8-a069fe99c6f5/question_61_file/1769108787132_REB_OPE_08_PLR_Gerente_Unidades_FY25_17.pdf |

## Itens pendentes para completar este inventário

- [x] Download e indexação de arquivos de **blobs** (Netlify)
- [x] Inserção manual de **PDFs** recebidos por e-mail em `../pdfs/` e indexação

## PDFs adicionados (e-mail → `../pdfs/`)

Observação: estes arquivos ainda não têm `submission_id`/`field_id` do formulário (origem externa). A rastreabilidade aqui é por **contrato/unidade/tema** e depois será conectada às perguntas/intervenções na matriz (FASE 4).

| Arquivo local | Origem | Unidade/Contrato | Tema | Observação |
|---|---|---|---|---|
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019) assinada.pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Proposta/condições gerais | Base contratual inicial |
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta + CG - (2019).pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Proposta/condições gerais | Versão duplicada (não assinada?) |
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Proposta | Revisão contratual |
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_4º Aditivo - (2023) assinado.pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Aditivo contratual | Ajustes/regras 2023 |
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_6º Aditivo - (2024) assinado.pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Aditivo contratual | Ajustes/regras 2024 |
| `../pdfs/Leroy Merlin/Leroy Merlin_Food_Proposta - (2024).pdf` | E-mail (PDF) | Leroy Merlin (Cajamar) | Proposta | Revisão 2024 (não assinada?) |
| `../pdfs/União Química/União Química_Contrato_Food - (2016)_assinado.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Contrato | Base contratual 2016 |
| `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2018)_assinada.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Proposta comercial | Escopo/preços 2018 |
| `../pdfs/União Química/União Química_Proposta Comercial_Food  - (2019)_assinada.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Proposta comercial | Escopo/preços 2019 |
| `../pdfs/União Química/União Química_Aditivo_Food - (2020)_assinado.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Aditivo contratual | Ajustes/regras 2020 |
| `../pdfs/União Química/Contrato FM Assinado 2021.pdf` | E-mail (PDF) | União Química (Guarulhos FM) | Contrato FM | Base contratual FM |
| `../pdfs/União Química/INOVAT_Aditivo Food - (2022) - assinado.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Aditivo contratual | Ajustes/regras 2022 |
| `../pdfs/União Química/F & F_Proposta Comercial_Food - (2022)_assinada.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Proposta comercial | Escopo/preços 2022 |
| `../pdfs/União Química/F & F_Proposta Comercial_Food  - (2022)_assinada (Summary).pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Proposta (summary) | Sumário executivo |
| `../pdfs/União Química/União Química_Aditivo_Food - (2024)_assinado.pdf` | E-mail (PDF) | União Química (Guarulhos Food) | Aditivo contratual | Ajustes/regras 2024 |
| `../pdfs/PLR/REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf` | E-mail (PDF) | Corporativo (FY25) | PLR gerentes | Documento também existe como blob |
| `../pdfs/PLR/REB_OPE_15_PLR_Operacional_Food_12.pdf` | E-mail (PDF) | Operação Food | PLR operacional | Complementar ao PLR gerentes |

## Observação — Escopo por unidade

O `unit_slug` por unidade (ex.: `cajamar`, `gru-food`, `gru-fm`) foi considerado **deprecado**. A extração mais recente foi feita com `unit_slug=general`.

Relatório do downloader (tentativas e resultados): `blobs-download-report.json`

## Tabela — Visão rápida por fonte

| Fonte | Pasta | Status | Observação |
|---|---|---:|---|
| Banco (Postgres) | `../banco/` | OK | Export realizado; há inventário específico |
| Blobs (Netlify) | `../blobs/` | OK | Downloads realizados para `relatoriosdx` (store `evidence-files`) |
| PDFs (E-mail) | `../pdfs/` | OK | PDFs inseridos manualmente e indexados |

## Próximos passos

1. Se houver novas submissões/anexos no banco, reexecutar o export e o downloader.
2. Salvar arquivos em `../blobs/` mantendo subpastas por `unit_slug` e/ou por `submission_id` (se necessário quando escalar).
3. Atualizar este inventário com:
   - nome do arquivo
   - origem
   - unidade
   - relação com intervenções (I-XX)

