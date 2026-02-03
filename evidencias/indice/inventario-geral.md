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

Lista simples (nomes):

- Base Frontline - Experimento.xlsx
- Tabela Salarial - Frontline Experimento.xlsx
- Planilha simulação aviso prévio indenizado.xlsx
- REB_OPE_08_PLR_Gerente Unidades FY25_17.pdf
- Descrição de cargo Frontline. FY26 (zip)
- FOLHA GERAL COLABORADORES JAN 2026.pdf
- Geral - Contratados por Centro de Custo.PDF
- Dados SAP Budget FY25 - FY26.xlsx
- Dados SAP Real Jan25-Dez25.xlsx
- Dados SAP Real x Budget EPI e Unif FY25.xlsx
- Relatórios de cardápio (JAN 26 — 307 Caseira Almoço)

Inventário detalhado (paths + `submission_id` + `field_id` + `blob_key` + versões): `inventario-blobs-detalhado.md`

## Tabelas derivadas (respostas `table_cell`)

- `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md` (quadro/salários/turnover/absenteísmo/INSS)
- `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_1.md` (custos operacionais/insumos)
- `tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md` (faturamento/margem)

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
2. Manter os blobs organizados em `../blobs/<submission_id>/<field_id>/...` (evita colisões e melhora rastreabilidade).
3. Atualizar este inventário com:
   - nome do arquivo
   - origem
   - unidade
   - relação com intervenções (I-XX)

