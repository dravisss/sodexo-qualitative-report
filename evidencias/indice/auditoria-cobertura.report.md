# Auditoria de Cobertura — MoC vs Repo vs Dossiês/Argumentários

Relatório de auditoria automática de cobertura e rastreabilidade (escopo `unit_slug=general`) com régua **S1** para suficiência de evidências por intervenção.

Gerado em: 2026-01-31

## 1) Resumo executivo (o que importa)

- **Rastreabilidade no MoC:** nenhuma referência quebrada detectada (`moc_missing=0`).
- **Rastreabilidade nos dossiês:** nenhuma referência quebrada detectada (placeholders `...` corrigidos).
- **MoC “enxuto” vs acervo real:** há muitos artefatos relevantes no repo que não estão listados no MoC, mas grande parte é **derivada** (CSV / `pdf.txt` / duplicatas de blobs) e não necessariamente “órfã”.
- **Gargalo real para S1:** muitos `I-XX` ainda não carregam âncoras citáveis suficientes no apêndice (há vários dossiês com 0 refs, ou refs genéricas como `answers.json` sem `submission_id`/`field_id`).

## 2) Métricas de cobertura (contagens)

Fonte: `evidencias/indice/auditoria-cobertura.report.json`

- **Arquivos relevantes no repo (pdf/pdf.txt/md/csv):** 179
- **Arquivos primários (heurística):** 49
- **Derivados canônicos (heurística):** 45
- **Referências no MoC:** 48
- **Referências em dossiês (I-XX):** 21
- **Referências em argumentários:** 6
- **MoC refs faltando no disco:** 0
- **Dossiê refs faltando no disco:** 0
- **Argumentário refs faltando no disco:** 0
- **Primários não referenciados em lugar nenhum:** 30
- **Derivados canônicos não referenciados em lugar nenhum:** 32

## 3) Deltas acionáveis

### 3.1) Referência quebrada (corrigir já)

- (Concluído) Placeholders `...` foram substituídos pelo `submission_id` correto nos dossiês afetados.

### 3.2) “Existe no repo, não está no MoC” (triagem por tipo)

Top grupos (quantidade de arquivos relevantes no repo não referenciados no MoC):

- **`evidencias/notas/ROTEIRO/*` (25):** sínteses do roteiro. Normal que não estejam todas no MoC se o MoC estiver focado em fontes primárias.
- **`evidencias/blobs/csv/*` (22):** derivados de XLSX. Recomenda-se listar apenas os CSVs canônicos (evitar `_tmp_*`).
- **`evidencias/pdfs/text/*` (19):** extrações `pdf.txt`. Recomenda-se o MoC apontar para o PDF fonte e opcionalmente para o `pdf.txt` canônico.
- **`evidencias/blobs/Descrição de cargo Frontline. FY26/*` (18):** PDFs extraídos do ZIP; MoC pode apontar para o ZIP + pasta extraída + Gemini.

Interpretação:
- Esse delta grande **não significa** evidência perdida automaticamente; em muitos casos é “artefato derivado” ou “duplicata rastreável”.

### 3.3) “Existe no repo, não está em nenhum dossiê/argumentário” (risco de evidência órfã)

Listas (limitadas a 200 itens no JSON) estão em:
- `not_referenced.primary`
- `not_referenced.derived_canonical`

Heurística de prioridade:
- **Alta:** contratos/PDFs ou planilhas que sustentam intervenções já priorizadas (I-03/I-04/I-19/I-21/I-22/I-26/I-27/I-30).
- **Média:** PDFs de RH/folha e centro de custo (se tiverem texto citável e conectarem com quadro/turnover).
- **Baixa:** duplicatas por `submission_id/field_id` que já têm “versão canônica” referenciada.

## 4) Observações específicas (S1)

Régua S1: cada I-XX deve ter **2 âncoras Provado** OU **1 Provado + 2 Sustentado**.

Achados:
- Há dossiês com **0 referências** no apêndice (sinal de que foram preenchidos mais por mecanismo/hipótese e menos por âncora citável).
- Em vários dossiês, aparecem referências amplas como `evidencias/banco/answers.json` sem apontar `submission_id`/`field_id`/`answer_id` (isso reduz força auditável).

Próxima ação (para cumprir S1):
- Para cada dossiê com 0–1 âncora, adicionar no apêndice:
  - Banco: `submission_id` + `field_id` + contexto (ou linha/ID em tabela derivada).
  - PDF: `evidencias/pdfs/text/...pdf.txt` + linhas.
  - CSV: arquivo + linhas relevantes.

## 5) Próximos passos recomendados (ordem)

1. **Corrigir placeholders `...`** nos dossiês (higiene de rastreabilidade). (Concluído)
2. **Lote S1 (calibração de padrão):** escolher 2 intervenções (ex.: I-04 + I-19) e elevar evidências até S1 com dupla checagem. (Em andamento)
3. **Escalar para lotes de 6 dossiês:** aplicar S1 e padronizar apêndices.
4. **Só então:** produzir argumentários restantes (36) em lotes, já herdando as âncoras auditáveis.

## 6) Apêndice — Artefatos gerados

- `evidencias/indice/auditoria-cobertura.report.json`
- `evidencias/indice/auditoria-cobertura.report.md`
