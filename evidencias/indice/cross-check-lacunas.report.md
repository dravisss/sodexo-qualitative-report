# Cross-check de lacunas — report (FASE 3.2)

Gerado em: 2026-01-30

## Objetivo
Consolidar lacunas registradas nas notas analíticas e verificar (quando possível) se já existe evidência no inventário (PDFs com texto extraído, CSVs derivados de blobs, banco/tabelas). Quando houver evidência direta, promover lacuna → claim na nota correspondente.

## Promoções (lacuna → claim) executadas

### 1) Leroy Merlin — 6º aditivo (2024): percentual do reajuste (Anexo I)
- Lacuna original: “extrair do Anexo I (Proposta Comercial 28/10/2024) o percentual e a base de cálculo do reajuste”
- Status: **RESOLVIDA (promovida a claim)**
- Onde foi aplicada:
  - Nota atualizada: `evidencias/notas/CONTRATOS/leroy-merlin-food-6-aditivo-2024.analise.md`
- Evidência usada (âncora):
  - `evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2024).pdf.txt`, linhas 103–107
- Claim promovida:
  - “Realinhamento aceito 3,50% a partir de Maio/2024; retroativo (maio–outubro) faturado em novembro/2024.”
- Lacuna remanescente (mesmo tópico):
  - extrair e auditar a “fórmula de contrato” (base do 4,20% solicitado) e como é calculada.

### 2) União Química — 4º aditivo (2024): tabela do Anexo I (investimento por unidade)
- Lacuna original: “ler Anexo I (lista detalhada dos itens e critérios por unidade) para mapear implicações operacionais.”
- Status: **PARCIALMENTE RESOLVIDA (promovida a claim: tabela por unidade já está no texto extraído)**
- Onde foi aplicada:
  - Nota atualizada: `evidencias/notas/CONTRATOS/uniao-quimica-food-4-aditivo-2024.analise.md`
- Evidência usada (âncora):
  - `evidencias/pdfs/text/União Química/União Química_Aditivo_Food - (2024)_assinado.pdf.txt`, linhas 67–76
- Claim promovida:
  - tabela lista unidades (inclui **GUARULHOS**) com valores “com encargos” e categorias de itens (Comunicação Visual, Equipamentos de cozinha, Utensílios, Uniformes).
- Lacuna remanescente:
  - extrair lista detalhada de itens/critério por unidade (se existir além das categorias resumidas).

## Lacunas priorizadas (status atual)

### A) Leroy Merlin — 4º aditivo (2023): anexos (proposta/carta/planilha)
- Onde aparece:
  - `evidencias/notas/CONTRATOS/leroy-merlin-food-4-aditivo-2023.analise.md`
- Status: **FORA DO ACERVO ATUAL (anexos citados, mas conteúdo dos anexos não está disponível no repositório)**
- Evidência (o que já sabemos):
  - O texto/OCR do aditivo lista “Documentos anexos: (i) Proposta Comercial 01/09/2022; (ii) Carta de Reajuste 10/08/2022; (iii) Planilha de Cálculo do Reajuste”, mas não há arquivos separados com esses nomes em `evidencias/`.
- Próximo passo:
  - Tratar como lacuna de coleta: obter os anexos (ou confirmar com fonte) e inserir no acervo para permitir claims auditáveis de fórmula/mecanismo do reajuste.

### B) Leroy Merlin — Proposta reajuste (10/2024): “fórmula de contrato” 4,20%
- Onde aparece:
  - `evidencias/notas/CONTRATOS/leroy-merlin-food-proposta-reajuste-2024.analise.md`
  - `evidencias/notas/CONTRATOS/leroy-merlin-food-6-aditivo-2024.analise.md`
- Status: **PARCIALMENTE RESOLVIDA (confirmada a existência do rótulo “fórmula de contrato”; fórmula/indexador não está explicitado no texto)**
- Evidência (âncora):
  - `evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2024).pdf.txt`, linhas 103–107
- Observação:
  - o documento afirma “Realinhamento solicitado, com base na fórmula de contrato: 4,20% (...)” mas não detalha qual é a fórmula (indexador, composição, baseline). A lacuna passa a ser “obter a fórmula corporativa/contrato base” (potencialmente fora do acervo atual).

### C) União Química — Proposta (2019): mínimo faturamento (valores)
- Onde aparece:
  - `evidencias/notas/CONTRATOS/uniao-quimica-food-proposta-2019.analise.md`
- Status: **PARCIALMENTE RESOLVIDA (existe seção identificada), mas VALORES permanecem pendentes (OCR2 corrompido/ilegível)**
- Evidência candidata:
  - `evidencias/pdfs/text/União Química/União Química_Proposta Comercial_Food  - (2019)_assinada.pdf.txt` (busca por “mínimo/faturamento” não retornou resultados)
  - `evidencias/pdfs/text/ocr2/União Química_Proposta Comercial_Food  - (2019)_assinada_ocr.txt` (há rótulo “MÍNIMO FATURAMENTO”, mas números estão corrompidos/ilegíveis; requer melhor extração)
- Evidência (âncora do rótulo e do problema de legibilidade):
  - `evidencias/pdfs/text/ocr2/União Química_Proposta Comercial_Food  - (2019)_assinada_ocr.txt`, linhas 227–233

#### Verificação adicional (executada)
- O OCR2 contém o rótulo “MÍNIMO FATURAMENTO” e fragmentos numéricos próximos, mas os números permanecem inconsistentes/ruidosos para transformar em claim auditável.
- Referência: `evidencias/pdfs/text/ocr2/União Química_Proposta Comercial_Food  - (2019)_assinada_ocr.txt`, linhas 227–233 (mesma âncora acima).

### D) União Química — 4º aditivo (2024): Anexo I (itens por unidade)
- Onde aparece:
  - `evidencias/notas/CONTRATOS/uniao-quimica-food-4-aditivo-2024.analise.md`
- Status: **RESOLVIDA (parcialmente)**
- Evidência candidata:
  - `evidencias/pdfs/text/União Química/União Química_Aditivo_Food - (2024)_assinado.pdf.txt` (verificar se o Anexo I está textualizado no mesmo arquivo).

### E) Quadro e salários — PDFs (blobs): falta de texto extraído
 - Onde aparece:
   - `evidencias/notas/QUADRO_E_SALARIOS/folha-geral-colaboradores-jan-2026.analise.md`
   - `evidencias/notas/QUADRO_E_SALARIOS/contratados-por-centro-de-custo.analise.md`
 - Status: **RESOLVIDA (texto extraído disponível)**
 - Evidência (âncoras):
   - `evidencias/pdfs/text/blobs/FOLHA GERAL COLABORADORES JAN 2026.pdf.txt`
   - `evidencias/pdfs/text/blobs/Geral - Contratados por Centro de Custo.PDF.txt`
 - Observação:
   - os arquivos blob na raiz `evidencias/blobs/` estavam malformados para extração (pdftotext/pdfinfo). Após re-download (cópia íntegra) e substituição, o texto passou a ser extraível e auditável por linhas.

### F) Roteiro — C. Faturamento e margem de lucro: valor anual contrato e GM target numérico
- Onde aparece:
  - `evidencias/notas/ROTEIRO/due-diligence-operacional/C-faturamento-e-margem-de-lucro.analise.md`
- Status: **PENDENTE**
- Evidência candidata:
  - valor anual pode estar nos PDFs de contratos/propostas (Leroy/União Química) ou em SAP (mas isso exige regra de conversão/competência).
  - GM target depende de PFP/documentação corporativa (pode estar fora do acervo atual).

#### Cross-check (estado com o acervo atual)
- Valor anual do contrato:
  - Status: **PENDENTE (fora do acervo textual atual)**
  - Evidência: a tabela do banco explicita que o valor anual foi “Enviado e-mail”, sem valor numérico.
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linha “Valor anual do contrato”.
- GM target numérico:
  - Status: **PENDENTE (depende de PFP)**
  - Evidência: a tabela do banco aponta “PFP (Juliana Vieceli)” como fonte/responsável, não o valor.
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linha “Margem Bruta contratada (GM target)”.
- Delta (contratado vs realizado):
  - Status: **PARCIALMENTE SUPORTÁVEL (SAP), mas sem reconciliação fechada**
  - Evidência: a tabela do banco manda “Analisar PFP e SAP”; o acervo já tem SAP real/budget para Leroy/INOVAT.
    - Notas SAP: `evidencias/indice/moc.md` → seção `SAP (blobs → CSV)`.
  - Lacuna remanescente: falta regra auditável de como “GM” do formulário se reconcilia com linhas do SAP (ex.: quais classes entram, sinais/competência) e falta o GM target numérico do PFP.

### G) Roteiro — A. Quadro de Pessoal e Salários: quantidade por cargo e salário por cargo
- Onde aparece:
  - `evidencias/notas/ROTEIRO/due-diligence-operacional/A-quadro-de-pessoal-e-salarios.analise.md`
- Status: **PARCIALMENTE RESOLVIDA (há evidência agregada em blobs, mas falta recorte por unidade)**
- Evidência usada:
  - Contagem por cargo (agregado): `evidencias/blobs/csv/remuneracao/Base_Frontline_-_Experimento/Base Frontline - Experimento.csv` (linhas 3–24; total 93).
  - Faixas salariais por cargo (mín/max): `evidencias/blobs/csv/remuneracao/Tabela_Salarial_-_Frontline_Experimento/Tabela_Salarial_-_Frontline_Experimento.csv` (linhas 1–13).
- Lacuna remanescente:
  - mapear contagem por cargo e salário base praticado **por unidade** (Cajamar/GRU Food/GRU FM) e reconciliar com a tabela do submission principal.

### H) Roteiro — B. Custos Operacionais e Insumos: overhead e “Budget aprovado” (%)
- Onde aparece:
  - `evidencias/notas/ROTEIRO/due-diligence-operacional/B-custos-operacionais-e-insumos.analise.md`
- Status: **PENDENTE (denominador e mapeamento de unidade não definidos)**
- Evidência existente:
  - tabela do formulário reporta overhead para GRU FOOD/GRU FM e “Budget aprovado” como percentuais.
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_1.md`, linhas 19–20.
  - existem CSVs SAP com budget/real em valores absolutos (faturamento/consumo/pessoal), mas falta o mapeamento auditável para GRU FOOD/GRU FM e a definição do denominador do percentual.
    - `evidencias/indice/moc.md` → seção `SAP (blobs → CSV)`.

### I) Roteiro — D. Volumetria e Capacidade: Cajamar (contrato)
- Onde aparece:
  - `evidencias/notas/ROTEIRO/due-diligence-operacional/D-volumetria-e-capacidade.analise.md`
- Status: **PARCIALMENTE RESOLVIDA (contrato traz mínimo por turno e faturamento mínimo)**
- Evidência usada:
  - Proposta Leroy 2020: `evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf.txt`, linhas 143–161.
- Lacuna remanescente:
  - ainda falta “volume médio diário” e confirmação de outras células de Cajamar que apontam apenas “Contrato/PFP”.

## Próximas promoções (candidatas em lote)
- Leroy 4º aditivo 2023: tentar confirmar se anexos (proposta/carta/planilha) estão incorporados no PDF (ou se existem em outro arquivo do inventário).
- União Química 2024: tentar localizar no texto extraído do PDF o conteúdo do Anexo I (mesmo que parcial) e promover itens por unidade quando houver trecho legível.
- União Química 2019: varrer OCR2/texto por “mínimo”/“faturamento mínimo” e localizar página/trecho legível para transformar a lacuna em claim.
