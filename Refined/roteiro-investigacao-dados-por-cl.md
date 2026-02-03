# Roteiro de investigação — análise de dados por CL (unidades como aparecem nos dados)

Objetivo: organizar um checklist de perguntas mensuráveis para analisar os dados disponíveis por centro de custo (`CL`) — com definições operacionais, fontes prováveis no acervo e lacunas.

Escopo (opção B): trabalhar estritamente com as unidades como aparecem nos dados.

- `BR012302` — `INOVAT`
- `BR014545` — `LEROY MERLIN CAJAMAR`
- `BR016517` — `INOVAT SP SOFT - FM`

Observação: quando o uso executivo exigir, a “tradução” desses CLs para a narrativa (ex.: União Química Food/FM) deve ser feita fora deste documento, para manter rastreabilidade pelo identificador do dado.

---

## 0) Pré-condições (para evitar comparações inválidas)

1. Definir janela de análise (ex.: `FY25 full`, `FY26 YTD P04`, `últimos 12 meses`).
2. Definir convenções do SAP:
   - Se `Faturamento Líquido` aparece com sinal negativo/positivo.
   - Qual linha de GP é “canônica” (`Gross Profit`, `Gross Profit Exc. IFRS16`).
3. Fixar fonte primária para cada tipo de métrica:
   - Financeiro: SAP (Real/Budget)
   - Quadro/salário base: base de colaboradores (ex.: “Base Frontline Experimento”)
   - Custo de folha completo: preferir SAP (`Pessoal`) quando existir; caso contrário, explicitar que é proxy.

---

## A) Economia da operação (custo, lucro, margem)

### A1) Qual é o custo real da operação hoje e quanto ela lucra?
- Definição operacional:
  - Receita: `Faturamento Líquido` (SAP Real).
  - Lucro: `Gross Profit` (SAP Real).
  - Custo (proxy): `Faturamento Líquido - Gross Profit` (quando as linhas forem compatíveis).
- Fonte provável:
  - `evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR*.csv`
  - `evidencias/blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR*.csv`
- Lacunas:
  - Confirmar conceito de GP e sinais.

### A2) Qual é a margem (%) e como ela evolui mês a mês?
- Definição operacional:
  - `GM% = Gross Profit / Faturamento Líquido`.
  - Construir série mensal para cada CL.
- Fonte provável:
  - SAP Real (mensal) por CL.
- Lacunas:
  - Mapear corretamente o período/colunas (alguns CSVs têm dois blocos de meses).

### A3) O que está “comendo” a margem? (decomposição)
- Definição operacional:
  - Decompor variações de GP em categorias (ex.: `Consumo`, `Pessoal`, `Serviços`, `Manutenção`) usando linhas agregadas do SAP.
- Fonte provável:
  - SAP Real por linhas agregadas (`* Consumo`, `* Pessoal`, etc.).
- Lacunas:
  - Necessidade de um mapa simples de categorias para agrupar classes.

### A4) Real vs Budget: onde o plano quebra sistematicamente?
- Definição operacional:
  - Para cada CL, comparar `Real` vs `Budget` em `Faturamento`, `Consumo`, `Pessoal`, `Gross Profit`.
  - Identificar itens com desvio recorrente.
- Fonte provável:
  - SAP Real + SAP Budget.
- Lacunas:
  - Confirmar se as estruturas Real/Budget são comparáveis no mesmo nível.

---

## B) Folha vs lucro (custo de pessoas versus resultado)

### B1) Quanto custa a folha vs o que a operação lucra?
- Definição operacional:
  - Folha (preferida): linha SAP `* Pessoal` (Real).
  - Folha (proxy): soma de `salário base` da base de colaboradores por CL.
  - Métricas:
    - `Folha / Faturamento`.
    - `Folha / Gross Profit`.
- Fonte provável:
  - SAP Real (se houver linha agregada `Pessoal`).
  - Base de colaboradores (salário base).
- Lacunas:
  - Salário base subestima custo completo (encargos/benefícios/HE).

### B2) Produtividade de folha
- Definição operacional:
  - `Faturamento por headcount`.
  - `Gross Profit por headcount`.
- Fonte provável:
  - SAP (faturamento/GP) + base de colaboradores (headcount por CL).
- Lacunas:
  - Headcount pode ser fotografia de um período; explicitar janela.

---

## C) Distribuição salarial (equidade, compressão e estrutura)

### C1) Qual a diferença entre o menor e o maior salário na operação?
- Definição operacional:
  - Por CL: `min(salário base)` e `max(salário base)` e o delta.
- Fonte provável:
  - Base de colaboradores por CL.
- Lacunas:
  - Limpeza/normalização do campo de salário.

### C2) Como é a distribuição salarial (p10/p50/p90) e a compressão?
- Definição operacional:
  - `p10`, `p50`, `p90`.
  - Razões: `p90/p10`, `max/min`.
- Fonte provável:
  - Base de colaboradores.
- Lacunas:
  - Mesmas de C1; tratar outliers (ex.: liderança).

### C3) Quanto do quadro está concentrado em 1–2 cargos?
- Definição operacional:
  - Top cargos por headcount e % do total.
  - Top cargos por massa salarial e % do total.
- Fonte provável:
  - Base de colaboradores.
- Lacunas:
  - Padronização de nomes de cargos.

---

## D) Serviços gerais / menor salário / composição do quadro

### D1) Quantas pessoas estão em cargos de Serviços Gerais e qual % do quadro?
- Definição operacional:
  - Definir um dicionário de cargos incluídos (ex.: `AUXILIAR SERVICOS GERAIS`, `OFICIAL SERVICOS GERAIS`).
  - Métricas: `N` e `%` do total.
- Fonte provável:
  - Base de colaboradores (colunas de cargo).
- Lacunas:
  - Dicionário de cargos e variações de nomes.

### D2) Qual % do quadro recebe o menor salário (piso efetivo no CL)?
- Definição operacional:
  - `min_sal` por CL.
  - `%_min = count(salário == min_sal) / headcount_total`.
  - Alternativa: `%_até_min+ε` para lidar com centavos/diferenças.
- Fonte provável:
  - Base de colaboradores.
- Lacunas:
  - Definir tolerância `ε`.

### D3) O “piso” é a maior parte do quadro?
- Definição operacional:
  - Criar uma regra de leitura (ex.: `>40%` alto, `20–40%` médio, `<20%` baixo).
- Fonte provável:
  - Derivado de D2.
- Lacunas:
  - Threshold é decisão analítica; explicitar.

---

## E) Perguntas adicionais de alto valor (para análise e decisão)

### E1) Onde a operação está mais “sensível” a variação de volume?
- Pergunta:
  - Quando o faturamento sobe/desce, o GP acompanha proporcionalmente ou há assimetria?
- Como medir:
  - Correlação/elasticidade entre faturamento e GP por mês.

### E2) Qual é a parcela de custo controlável localmente?
- Pergunta:
  - Quanto do custo é potencialmente ajustável pela unidade sem risco (ex.: consumo e manutenção) versus fixo (pessoal, contratos)?
- Como medir:
  - Classificar linhas do SAP em controlável vs não controlável.

### E3) Há sinais contábeis de “torniquete” (corte de essencial)?
- Pergunta:
  - Há evidência de desvio em itens essenciais (EPI/uniforme/manutenção crítica) associado a períodos de piora?
- Como medir:
  - Real vs Budget de classes essenciais + leitura qualitativa de operação.

### E4) Qual é a dependência de poucos indivíduos (risco operacional)?
- Pergunta:
  - A massa salarial e funções críticas estão concentradas em poucas pessoas?
- Como medir:
  - Top N salários e % da massa salarial; cargos-chave.

### E5) Comparabilidade entre CLs: o que é “igual” e o que não é?
- Pergunta:
  - Food vs FM e diferenças de escopo alteram a interpretação de margem e folha.
- Como medir:
  - Documentar escopo (contrato) e comparar apenas métricas comparáveis.

---

## Apêndice — fontes do acervo (atalhos)

- SAP (Real/Budget):
  - `evidencias/blobs/csv/sap/`
- Base de colaboradores (com `Ccusto`, `Cargo`, `Salário Base`):
  - `evidencias/blobs/csv/Base Frontline Experimento/BASE-Tabela 1.csv`
- Folha / centros de custo (PDF):
  - `evidencias/blobs/Geral - Contratados por Centro de Custo.PDF`

