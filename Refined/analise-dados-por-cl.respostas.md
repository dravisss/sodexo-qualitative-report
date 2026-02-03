# Respostas (parciais, com rastreabilidade) — análise por CL

Escopo: unidades como aparecem nos dados.

- `BR012302` — `INOVAT`
- `BR014545` — `LEROY MERLIN CAJAMAR`
- `BR016517` — `INOVAT SP SOFT - FM`

## Notas de método (importante)

- Financeiro (custo/lucro): extraído do SAP (CSV) via linhas agregadas.
- Convenção de sinal: nos CSVs, `*   Faturamento Líquido` e `Gross Profit` aparecem com sinal **negativo**. Para leitura gerencial, abaixo eu reporto também o **valor absoluto**.
- “Custo real da operação”: aqui é um **proxy** calculado como `|Faturamento Líquido| - |Gross Profit|` (não é a DRE completa). Serve para responder a pergunta “quanto custa operar” no nível mais alto com o acervo atual.
- “Folha”: usei a linha SAP `*   Pessoal` (mais próxima de custo real contabilizado) e, separadamente, uma proxy de **massa salarial base** a partir da base de colaboradores.
- Base de colaboradores: salário é `Salario Base` (mensal) e não inclui encargos/benefícios/HE. Headcount calculado apenas para registros com salário parseável.
- Definição “Serviços Gerais” (mais robusta): classifiquei por `Cd Cargo` na base de colaboradores.
  - Incluídos: `677` (OFICIAL SERVIÇOS GERAIS I) e `193292` (AUXILIAR SERVIÇOS GERAIS I).
  - Observação: há códigos relacionados no índice de cargos (`193387`, `193485`) mas não apareceram na base atual.
- Tratamento de aprendizes (para análise de “piso”): separei por `Cd Cargo`.
  - Aprendiz administrativo: `56151`.
  - Aprendiz operacional: `987`.
  - Reporto o “piso” tanto no conjunto completo quanto no conjunto **excluindo aprendizes**.

---

## 1) `BR014545` — `LEROY MERLIN CAJAMAR`

### 1.1 Custo real da operação hoje e quanto ela lucra? (SAP)

| Janela | Faturamento Líquido (Total Exer) | Gross Profit Exc. IFRS16 (Total Exer) | GM% (GP/Fat) | Custo proxy (Fat−GP) |
|---|---:|---:|---:|---:|
| FY25 (Set/24–Ago/25) | 7.125.365,94 | 863.094,06 | 12,11% | 6.262.271,88 |
| FY26 YTD (Set/25–Jan/26) | 2.564.162,65 | 166.591,28 | 6,50% | 2.397.571,37 |

Leitura:
- FY25: margem de ~12% no agregado.
- FY26 YTD: margem menor (~6,5%) no recorte Set/25–Jan/26.

### 1.1.1 A2 — Margem (%) e evolução mês a mês (SAP Real)

Observação: `Faturamento Líquido` e `Gross Profit Exc. IFRS16` estão em **valor absoluto** para leitura gerencial.

FY25 (Set/24–Ago/25)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/24 | 607.385,58 | 70.488,93 | 11,61% | 158.756,59 | 402.584,04 |
| Out/24 | 713.784,71 | 142.386,37 | 19,95% | 164.072,50 | 439.627,85 |
| Nov/24 | 630.377,66 | 70.461,52 | 11,18% | 175.965,71 | 410.803,27 |
| Dez/24 | 630.709,45 | 94.989,93 | 15,06% | 155.903,00 | 397.760,87 |
| Jan/25 | 591.770,29 | 66.419,75 | 11,22% | 167.200,24 | 403.631,34 |
| Fev/25 | 560.982,87 | 49.819,46 | 8,88% | 168.501,94 | 351.371,46 |
| Mar/25 | 718.987,35 | 151.704,50 | 21,10% | 167.680,77 | 427.628,64 |
| Abr/25 | 524.359,10 | 8.103,73 | 1,55% | 147.943,40 | 367.872,44 |
| Mai/25 | 541.451,79 | 28.404,31 | 5,25% | 176.584,60 | 352.066,51 |
| Jun/25 | 516.004,09 | 8.735,17 | 1,69% | 170.279,80 | 359.736,51 |
| Jul/25 | 528.633,75 | 30.379,33 | 5,75% | 141.789,99 | 395.343,89 |
| Ago/25 | 560.919,30 | 141.201,06 | 25,17% | 147.635,74 | 321.581,11 |

FY26 (Set/25–Jan/26)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/25 | 599.002,08 | 103.513,79 | 17,28% | 141.200,11 | 366.922,64 |
| Out/25 | 689.697,13 | 123.086,53 | 17,85% | 166.777,43 | 421.385,19 |
| Nov/25 | 604.459,17 | 41.796,87 | 6,91% | 193.985,13 | 393.921,65 |
| Dez/25 | 488.813,15 | 17.849,67 | 3,65% | 175.021,68 | 313.047,09 |
| Jan/26 | 182.191,12 | 119.655,58 | 65,68% | 46.107,06 | 238.734,21 |

### 1.1.2 A4 — Real vs Budget (SAP) por mês

Faturamento Líquido — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 607.385,58 | 606.554,45 | 831,13 | 0,14% |
| Out/24 | 713.784,71 | 739.336,62 | -25.551,91 | -3,46% |
| Nov/24 | 630.377,66 | 670.138,41 | -39.760,75 | -5,93% |
| Dez/24 | 630.709,45 | 629.432,51 | 1.276,94 | 0,20% |
| Jan/25 | 591.770,29 | 654.161,16 | -62.390,87 | -9,54% |
| Fev/25 | 560.982,87 | 579.975,20 | -18.992,33 | -3,27% |
| Mar/25 | 718.987,35 | 572.210,35 | 146.777,00 | 25,65% |
| Abr/25 | 524.359,10 | 604.703,86 | -80.344,76 | -13,29% |
| Mai/25 | 541.451,79 | 683.887,29 | -142.435,50 | -20,83% |
| Jun/25 | 516.004,09 | 639.776,68 | -123.772,59 | -19,35% |
| Jul/25 | 528.633,75 | 692.102,52 | -163.468,77 | -23,62% |
| Ago/25 | 560.919,30 | 706.901,25 | -145.981,95 | -20,65% |

Faturamento Líquido — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 599.002,08 | 657.874,27 | -58.872,19 | -8,95% |
| Out/25 | 689.697,13 | 680.424,82 | 9.272,31 | 1,36% |
| Nov/25 | 604.459,17 | 598.859,50 | 5.599,67 | 0,94% |
| Dez/25 | 488.813,15 | 632.436,10 | -143.622,95 | -22,71% |
| Jan/26 | 182.191,12 | 649.735,83 | -467.544,71 | -71,96% |

Gross Profit Exc. IFRS16 — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 70.488,93 | 80.430,90 | -9.941,97 | -12,36% |
| Out/24 | 142.386,37 | 143.469,97 | -1.083,60 | -0,76% |
| Nov/24 | 70.461,52 | 110.370,98 | -39.909,46 | -36,16% |
| Dez/24 | 94.989,93 | 96.886,41 | -1.896,48 | -1,96% |
| Jan/25 | 66.419,75 | 107.360,49 | -40.940,74 | -38,13% |
| Fev/25 | 49.819,46 | 71.322,60 | -21.503,14 | -30,15% |
| Mar/25 | 151.704,50 | 65.990,65 | 85.713,85 | 129,89% |
| Abr/25 | 8.103,73 | 75.871,43 | -67.767,70 | -89,32% |
| Mai/25 | 28.404,31 | 135.492,04 | -107.087,73 | -79,04% |
| Jun/25 | 8.735,17 | 102.814,49 | -94.079,32 | -91,50% |
| Jul/25 | 30.379,33 | 132.055,62 | -101.676,29 | -77,00% |
| Ago/25 | 141.201,06 | 153.772,33 | -12.571,27 | -8,18% |

Gross Profit Exc. IFRS16 — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 103.513,79 | 91.605,50 | 11.908,29 | 13,00% |
| Out/25 | 123.086,53 | 104.559,41 | 18.527,12 | 17,72% |
| Nov/25 | 41.796,87 | 61.244,15 | -19.447,28 | -31,75% |
| Dez/25 | 17.849,67 | 80.901,43 | -63.051,76 | -77,94% |
| Jan/26 | 119.655,58 | 100.120,80 | 19.534,78 | 19,51% |

Pessoal — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 158.756,59 | 185.796,54 | -27.039,95 | -14,55% |
| Out/24 | 164.072,50 | 190.061,96 | -25.989,46 | -13,67% |
| Nov/24 | 175.965,71 | 186.935,06 | -10.969,35 | -5,87% |
| Dez/24 | 155.903,00 | 176.517,45 | -20.614,45 | -11,68% |
| Jan/25 | 167.200,24 | 179.743,53 | -12.543,29 | -6,98% |
| Fev/25 | 168.501,94 | 177.974,18 | -9.472,24 | -5,32% |
| Mar/25 | 167.680,77 | 177.974,18 | -10.293,41 | -5,78% |
| Abr/25 | 147.943,40 | 180.966,18 | -33.022,78 | -18,25% |
| Mai/25 | 176.584,60 | 180.218,63 | -3.634,03 | -2,02% |
| Jun/25 | 170.279,80 | 189.982,05 | -19.702,25 | -10,37% |
| Jul/25 | 141.789,99 | 186.807,16 | -45.017,17 | -24,10% |
| Ago/25 | 147.635,74 | 189.975,05 | -42.339,31 | -22,29% |

Pessoal — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 141.200,11 | 172.575,80 | -31.375,69 | -18,18% |
| Out/25 | 166.777,43 | 173.472,93 | -6.695,50 | -3,86% |
| Nov/25 | 193.985,13 | 175.792,52 | 18.192,61 | 10,35% |
| Dez/25 | 175.021,68 | 172.194,02 | 2.827,66 | 1,64% |
| Jan/26 | 46.107,06 | 163.927,46 | -117.820,40 | -71,87% |

Consumo — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 402.584,04 | 366.107,63 | 36.476,41 | 9,96% |
| Out/24 | 439.627,85 | 442.307,70 | -2.679,85 | -0,61% |
| Nov/24 | 410.803,27 | 403.935,95 | 6.867,32 | 1,70% |
| Dez/24 | 397.760,87 | 380.889,25 | 16.871,62 | 4,43% |
| Jan/25 | 403.631,34 | 397.214,99 | 6.416,35 | 1,62% |
| Fev/25 | 351.371,46 | 354.879,02 | -3.507,56 | -0,99% |
| Mar/25 | 427.628,64 | 352.047,72 | 75.580,92 | 21,47% |
| Abr/25 | 367.872,44 | 372.204,83 | -4.332,39 | -1,16% |
| Mai/25 | 352.066,51 | 398.517,79 | -46.451,28 | -11,66% |
| Jun/25 | 359.736,51 | 373.850,25 | -14.113,74 | -3,78% |
| Jul/25 | 395.343,89 | 404.410,03 | -9.066,14 | -2,24% |
| Ago/25 | 321.581,11 | 412.206,35 | -90.625,24 | -21,99% |

Consumo — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 366.922,64 | 423.365,54 | -56.442,90 | -13,33% |
| Out/25 | 421.385,19 | 435.554,57 | -14.169,38 | -3,25% |
| Nov/25 | 393.921,65 | 384.400,52 | 9.521,13 | 2,48% |
| Dez/25 | 313.047,09 | 407.106,70 | -94.059,61 | -23,10% |
| Jan/26 | 238.734,21 | 415.309,77 | -176.575,56 | -42,52% |

### 1.2 Quanto custa a folha vs o que a operação lucra? (SAP)

| Janela | Pessoal (Total Exer) | Pessoal / Faturamento | Pessoal / Gross Profit |
|---|---:|---:|---:|
| FY25 | 1.942.314,28 | 27,26% | 2,25x |
| FY26 YTD | 723.091,41 | 28,20% | 4,34x |

Leitura:
- A linha `Pessoal` é ~27–28% do faturamento, mas é maior que o GP (logo, sozinha já excede o “lucro bruto”).

### 1.3 Diferença salarial (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Headcount (registros com salário) | 23 |
| Salário base mínimo | 1.933,20 |
| Salário base máximo | 7.000,00 |
| Delta (max − min) | 5.066,80 |
| p10 / p50 / p90 (salário base) | 1.933,20 / 2.106,79 / 2.674,86 |

### 1.4 Serviços Gerais e “piso” (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Pessoas em cargos com “Serviços Gerais” | 10 |
| % do quadro em “Serviços Gerais” | 43,48% |
| Pessoas no salário mínimo do CL | 10 |
| % do quadro no salário mínimo do CL | 43,48% |

Leitura:
- Neste CL, a contagem de “Serviços Gerais” coincide com a concentração no menor salário: **~43% do quadro**.

### Rastreabilidade (Leroy)
- SAP Real:
  - `evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR014545_LEROY_MERLIN_CAJAMAR.csv`
    - `*   Faturamento Líquido`: linha 12
    - `*   Pessoal`: linha 82
    - `**  Gross Profit Exc. IFRS16`: linha 146
- Base de colaboradores:
  - `evidencias/blobs/csv/Base Frontline Experimento/BASE-Tabela 1.csv` (filtrar `Ccusto=BR014545`; coluna `Cargo`; coluna `Salario Base`)

---

## 2) `BR012302` — `INOVAT`

### 2.1 Custo real da operação hoje e quanto ela lucra? (SAP)

| Janela | Faturamento Líquido (Total Exer) | Gross Profit Exc. IFRS16 (Total Exer) | GM% (GP/Fat) | Custo proxy (Fat−GP) |
|---|---:|---:|---:|---:|
| FY25 (Set/24–Ago/25) | 4.733.386,25 | 494.540,41 | 10,45% | 4.238.845,84 |
| FY26 YTD (Set/25–Jan/26) | 1.923.697,96 | 27.582,08 | 1,43% | 1.896.115,88 |

Leitura:
- FY26 YTD mostra GP baixo no agregado do período.

Auditoria (FY26 YTD, linha `**  Gross Profit Exc. IFRS16` no SAP): o total baixo está consistente com a soma mensal do próprio CSV.
- Set/25: -82.811,50
- Out/25: -60.579,04
- Nov/25: -82.553,46
- Dez/25: -38.484,73
- Jan/26: 236.846,65
- Total Exer (Set/25–Jan/26): -27.582,08

### 2.1.1 A2 — Margem (%) e evolução mês a mês (SAP Real)

Observação: `Faturamento Líquido` e `Gross Profit Exc. IFRS16` estão em **valor absoluto** para leitura gerencial.

FY25 (Set/24–Ago/25)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/24 | 343.799,59 | 16.974,11 | 4,94% | 128.004,87 | 226.653,37 |
| Out/24 | 424.032,50 | 43.004,78 | 10,14% | 126.991,55 | 273.723,21 |
| Nov/24 | 369.264,40 | 38.931,52 | 10,54% | 118.128,28 | 227.601,03 |
| Dez/24 | 323.979,12 | 21.724,86 | 6,71% | 128.885,44 | 191.750,66 |
| Jan/25 | 363.439,91 | 6.017,88 | 1,66% | 125.328,58 | 253.607,30 |
| Fev/25 | 383.669,40 | 56.977,25 | 14,85% | 117.439,98 | 231.522,62 |
| Mar/25 | 401.448,30 | 61.454,73 | 15,31% | 116.167,84 | 253.157,47 |
| Abr/25 | 411.566,85 | 37.120,26 | 9,02% | 120.932,72 | 278.808,82 |
| Mai/25 | 432.430,76 | 70.720,95 | 16,35% | 123.936,79 | 260.999,11 |
| Jun/25 | 421.511,54 | 49.187,81 | 11,67% | 132.866,78 | 272.935,51 |
| Jul/25 | 442.477,06 | 8.025,91 | 1,81% | 139.743,94 | 311.565,30 |
| Ago/25 | 415.766,82 | 84.400,35 | 20,30% | 122.499,76 | 252.044,19 |

FY26 (Set/25–Jan/26)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/25 | 474.853,83 | 82.811,50 | 17,44% | 132.184,29 | 289.306,31 |
| Out/25 | 508.733,89 | 60.579,04 | 11,91% | 131.457,90 | 352.538,54 |
| Nov/25 | 479.975,67 | 82.553,46 | 17,20% | 132.907,86 | 297.461,66 |
| Dez/25 | 402.399,60 | 38.484,73 | 9,56% | 132.296,44 | 248.588,61 |
| Jan/26 | 57.734,97 | 236.846,65 | 410,23% | 10.341,50 | 282.019,48 |

### 2.1.2 A4 — Real vs Budget (SAP) por mês

Faturamento Líquido — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 343.799,59 | 348.372,63 | -4.573,04 | -1,31% |
| Out/24 | 424.032,50 | 380.105,72 | 43.926,78 | 11,56% |
| Nov/24 | 369.264,40 | 333.187,55 | 36.076,85 | 10,83% |
| Dez/24 | 323.979,12 | 341.470,88 | -17.491,76 | -5,12% |
| Jan/25 | 363.439,91 | 375.601,75 | -12.161,84 | -3,24% |
| Fev/25 | 383.669,40 | 363.386,89 | 20.282,51 | 5,58% |
| Mar/25 | 401.448,30 | 372.581,79 | 28.866,51 | 7,75% |
| Abr/25 | 411.566,85 | 369.941,47 | 41.625,38 | 11,25% |
| Mai/25 | 432.430,76 | 393.085,15 | 39.345,61 | 10,01% |
| Jun/25 | 421.511,54 | 369.941,47 | 51.570,07 | 13,94% |
| Jul/25 | 442.477,06 | 397.292,40 | 45.184,66 | 11,37% |
| Ago/25 | 415.766,82 | 387.040,72 | 28.726,10 | 7,42% |

Faturamento Líquido — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 474.853,83 | 441.331,17 | 33.522,66 | 7,60% |
| Out/25 | 508.733,89 | 454.254,42 | 54.479,47 | 11,99% |
| Nov/25 | 479.975,67 | 405.487,67 | 74.488,00 | 18,37% |
| Dez/25 | 402.399,60 | 384.390,59 | 18.009,01 | 4,69% |
| Jan/26 | 57.734,97 | 442.402,35 | -384.667,38 | -86,95% |

Gross Profit Exc. IFRS16 — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 16.974,11 | 12.341,07 | 4.633,04 | 37,54% |
| Out/24 | 43.004,78 | 50.500,07 | -7.495,29 | -14,84% |
| Nov/24 | 38.931,52 | 26.725,98 | 12.205,54 | 45,67% |
| Dez/24 | 21.724,86 | 21.452,64 | 272,22 | 1,27% |
| Jan/25 | 6.017,88 | 39.398,62 | -33.380,74 | -84,73% |
| Fev/25 | 56.977,25 | 26.970,20 | 30.007,05 | 111,26% |
| Mar/25 | 61.454,73 | 25.615,55 | 35.839,18 | 139,91% |
| Abr/25 | 37.120,26 | 42.529,15 | -5.408,89 | -12,72% |
| Mai/25 | 70.720,95 | 46.025,76 | 24.695,19 | 53,66% |
| Jun/25 | 49.187,81 | 16.068,32 | 33.119,49 | 206,12% |
| Jul/25 | 8.025,91 | 44.674,02 | -36.648,11 | -82,03% |
| Ago/25 | 84.400,35 | 47.942,99 | 36.457,36 | 76,04% |

Gross Profit Exc. IFRS16 — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 82.811,50 | 48.089,90 | 34.721,60 | 72,20% |
| Out/25 | 60.579,04 | 46.738,06 | 13.840,98 | 29,61% |
| Nov/25 | 82.553,46 | 30.531,87 | 52.021,59 | 170,38% |
| Dez/25 | 38.484,73 | 25.840,14 | 12.644,59 | 48,93% |
| Jan/26 | 236.846,65 | 43.450,52 | 193.396,13 | 445,10% |

Pessoal — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 128.004,87 | 120.778,22 | 7.226,65 | 5,98% |
| Out/24 | 126.991,55 | 115.318,57 | 11.672,98 | 10,12% |
| Nov/24 | 118.128,28 | 116.811,26 | 1.317,02 | 1,13% |
| Dez/24 | 128.885,44 | 118.144,92 | 10.740,52 | 9,09% |
| Jan/25 | 125.328,58 | 121.697,94 | 3.630,64 | 2,98% |
| Fev/25 | 117.439,98 | 137.699,90 | -20.259,92 | -14,71% |
| Mar/25 | 116.167,84 | 123.397,53 | -7.229,69 | -5,86% |
| Abr/25 | 120.932,72 | 122.117,38 | -1.184,66 | -0,97% |
| Mai/25 | 123.936,79 | 131.976,89 | -8.040,10 | -6,09% |
| Jun/25 | 132.866,78 | 130.839,75 | 2.027,03 | 1,55% |
| Jul/25 | 139.743,94 | 134.512,37 | 5.231,57 | 3,89% |
| Ago/25 | 122.499,76 | 134.868,94 | -12.369,18 | -9,17% |

Pessoal — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 132.184,29 | 132.149,82 | 34,47 | 0,03% |
| Out/25 | 131.457,90 | 135.154,09 | -3.696,19 | -2,73% |
| Nov/25 | 132.907,86 | 134.285,83 | -1.377,97 | -1,03% |
| Dez/25 | 132.296,44 | 133.004,74 | -708,30 | -0,53% |
| Jan/26 | 10.341,50 | 137.075,51 | -126.734,01 | -92,46% |

Consumo — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 226.653,37 | 235.573,94 | -8.920,57 | -3,79% |
| Out/24 | 273.723,21 | 232.638,70 | 41.084,51 | 17,66% |
| Nov/24 | 227.601,03 | 205.630,77 | 21.970,26 | 10,68% |
| Dez/24 | 191.750,66 | 212.369,81 | -20.619,15 | -9,71% |
| Jan/25 | 253.607,30 | 233.932,70 | 19.674,60 | 8,41% |
| Fev/25 | 231.522,62 | 215.660,60 | 15.862,02 | 7,36% |
| Mar/25 | 253.157,47 | 243.044,82 | 10.112,65 | 4,16% |
| Abr/25 | 278.808,82 | 220.843,21 | 57.965,61 | 26,25% |
| Mai/25 | 260.999,11 | 234.143,69 | 26.855,42 | 11,47% |
| Jun/25 | 272.935,51 | 243.802,50 | 29.133,01 | 11,95% |
| Jul/25 | 311.565,30 | 238.099,97 | 73.465,33 | 30,85% |
| Ago/25 | 252.044,19 | 232.630,50 | 19.413,69 | 8,35% |

Consumo — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 289.306,31 | 289.947,28 | -640,97 | -0,22% |
| Out/25 | 352.538,54 | 303.247,48 | 49.291,06 | 16,25% |
| Nov/25 | 297.461,66 | 264.945,59 | 32.516,07 | 12,27% |
| Dez/25 | 248.588,61 | 249.099,25 | -510,64 | -0,20% |
| Jan/26 | 282.019,48 | 302.117,60 | -20.098,12 | -6,65% |

### 2.2 Quanto custa a folha vs o que a operação lucra? (SAP)

| Janela | Pessoal (Total Exer) | Pessoal / Faturamento | Pessoal / Gross Profit |
|---|---:|---:|---:|
| FY25 | 1.500.926,53 | 31,71% | 3,03x |
| FY26 YTD | 539.187,99 | 28,03% | 19,55x |

Leitura:
- Como o GP FY26 YTD é muito baixo, a razão `Pessoal/GP` explode. Isso é um alerta de **qualidade/interpretabilidade** do GP no recorte.

### 2.3 Diferença salarial (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Headcount (registros com salário) | 21 |
| Salário base mínimo | 1.270,98 |
| Salário base máximo | 9.078,53 |
| Delta (max − min) | 7.807,55 |
| p10 / p50 / p90 (salário base) | 1.933,20 / 2.106,80 / 3.318,59 |

### 2.4 Serviços Gerais e “piso” (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Pessoas em cargos com “Serviços Gerais” | 7 |
| % do quadro em “Serviços Gerais” | 33,33% |
| Pessoas no salário mínimo do CL | 1 |
| % do quadro no salário mínimo do CL | 4,76% |
| Piso (excluindo aprendizes) | 1.933,20 |
| % no piso (excluindo aprendizes) | 35,00% |

Leitura:
- “Serviços Gerais” é ~1/3 do quadro (na base disponível), mas o menor salário aparece em poucos casos.

### Rastreabilidade (INOVAT)
- SAP Real:
  - `evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR012302_INOVAT.csv`
    - `*   Faturamento Líquido`: linha 14
    - `*   Pessoal`: linha 78
    - `**  Gross Profit Exc. IFRS16`: linha 131
- Base de colaboradores:
  - `evidencias/blobs/csv/Base Frontline Experimento/BASE-Tabela 1.csv` (filtrar `Ccusto=BR012302`; coluna `Cargo`; coluna `Salario Base`)

---

## 3) `BR016517` — `INOVAT SP SOFT - FM`

### 3.1 Custo real da operação hoje e quanto ela lucra? (SAP)

| Janela | Faturamento Líquido (Total Exer) | Gross Profit Exc. IFRS16 (Total Exer) | GM% (GP/Fat) | Custo proxy (Fat−GP) |
|---|---:|---:|---:|---:|
| FY25 (Set/24–Ago/25) | 2.921.728,15 | 571.123,80 | 19,55% | 2.350.604,35 |
| FY26 YTD (Set/25–Jan/26) | 1.280.244,11 | 372.394,48 | 29,09% | 907.849,63 |

Leitura:
- Este CL mostra GM% mais alto que os outros, especialmente no FY26 YTD.

### 3.1.1 A2 — Margem (%) e evolução mês a mês (SAP Real)

Observação: `Faturamento Líquido` e `Gross Profit Exc. IFRS16` estão em **valor absoluto** para leitura gerencial.

FY25 (Set/24–Ago/25)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/24 | 217.107,83 | 47.742,41 | 21,99% | 154.772,09 | 3.450,29 |
| Out/24 | 218.751,31 | 26.791,27 | 12,25% | 175.580,66 | 3.089,31 |
| Nov/24 | 218.751,31 | 34.034,13 | 15,56% | 162.198,51 | 6.376,14 |
| Dez/24 | 232.051,00 | 72.863,29 | 31,40% | 148.425,43 | 2.998,29 |
| Jan/25 | 221.132,29 | 51.505,00 | 23,29% | 160.165,72 | 3.272,74 |
| Fev/25 | 283.579,30 | 110.325,33 | 38,90% | 152.457,78 | 4.836,73 |
| Mar/25 | 248.486,51 | 47.766,64 | 19,22% | 175.510,18 | 3.694,52 |
| Abr/25 | 248.486,50 | 30.059,05 | 12,10% | 197.531,11 | 4.721,44 |
| Mai/25 | 252.510,99 | 29.904,58 | 11,84% | 198.486,37 | 6.542,37 |
| Jun/25 | 252.510,97 | 42.857,96 | 16,97% | 196.750,80 | 6.806,86 |
| Jul/25 | 252.510,97 | 5.543,24 | 2,20% | 236.759,44 | 4.281,75 |
| Ago/25 | 275.849,17 | 82.817,38 | 30,02% | 186.417,51 | 4.442,68 |

FY26 (Set/25–Jan/26)

| Mês | Faturamento Líquido | Gross Profit Exc. IFRS16 | GM% | Pessoal | Consumo |
|---|---:|---:|---:|---:|---:|
| Set/25 | 259.939,24 | 48.309,85 | 18,59% | 202.774,68 | -315,57 |
| Out/25 | 252.510,97 | 43.919,62 | 17,39% | 196.470,38 | 5.083,24 |
| Nov/25 | 259.939,23 | 50.792,08 | 19,54% | 194.750,53 | 4.366,57 |
| Dez/25 | 259.939,23 | 34.234,57 | 13,17% | 210.677,01 | 2.015,28 |
| Jan/26 | 247.915,44 | 195.138,36 | 78,71% | 28.026,77 | 5.894,12 |

### 3.1.2 A4 — Real vs Budget (SAP) por mês

Faturamento Líquido — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 217.107,83 | 217.107,84 | -0,01 | -0,00% |
| Out/24 | 218.751,31 | 217.107,84 | 1.643,47 | 0,76% |
| Nov/24 | 218.751,31 | 217.107,84 | 1.643,47 | 0,76% |
| Dez/24 | 232.051,00 | 217.107,84 | 14.943,16 | 6,88% |
| Jan/25 | 221.132,29 | 237.588,62 | -16.456,33 | -6,93% |
| Fev/25 | 283.579,30 | 237.588,62 | 45.990,68 | 19,36% |
| Mar/25 | 248.486,51 | 237.588,62 | 10.897,89 | 4,59% |
| Abr/25 | 248.486,50 | 237.588,62 | 10.897,88 | 4,59% |
| Mai/25 | 252.510,99 | 237.588,62 | 14.922,37 | 6,28% |
| Jun/25 | 252.510,97 | 237.588,62 | 14.922,35 | 6,28% |
| Jul/25 | 252.510,97 | 237.588,62 | 14.922,35 | 6,28% |
| Ago/25 | 275.849,17 | 237.588,62 | 38.260,55 | 16,10% |

Faturamento Líquido — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 259.939,24 | 262.816,03 | -2.876,79 | -1,09% |
| Out/25 | 252.510,97 | 262.816,03 | -10.305,06 | -3,92% |
| Nov/25 | 259.939,23 | 262.816,03 | -2.876,80 | -1,09% |
| Dez/25 | 259.939,23 | 262.816,03 | -2.876,80 | -1,09% |
| Jan/26 | 247.915,44 | 281.292,00 | -33.376,56 | -11,87% |

Gross Profit Exc. IFRS16 — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 47.742,41 | 25.913,51 | 21.828,90 | 84,24% |
| Out/24 | 26.791,27 | 19.760,87 | 7.030,40 | 35,58% |
| Nov/24 | 34.034,13 | 29.466,72 | 4.567,41 | 15,50% |
| Dez/24 | 72.863,29 | 29.608,67 | 43.254,62 | 146,09% |
| Jan/25 | 51.505,00 | 26.042,37 | 25.462,63 | 97,77% |
| Fev/25 | 110.325,33 | 26.700,24 | 83.625,09 | 313,20% |
| Mar/25 | 47.766,64 | 26.001,39 | 21.765,25 | 83,71% |
| Abr/25 | 30.059,05 | 15.130,31 | 14.928,74 | 98,67% |
| Mai/25 | 29.904,58 | 25.813,03 | 4.091,55 | 15,85% |
| Jun/25 | 42.857,96 | 26.575,61 | 16.282,35 | 61,27% |
| Jul/25 | 5.543,24 | 26.638,72 | -21.095,48 | -79,19% |
| Ago/25 | 82.817,38 | 26.879,95 | 55.937,43 | 208,10% |

Gross Profit Exc. IFRS16 — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 48.309,85 | 43.157,81 | 5.152,04 | 11,94% |
| Out/25 | 43.919,62 | 33.137,70 | 10.781,92 | 32,54% |
| Nov/25 | 50.792,08 | 41.466,83 | 9.325,25 | 22,49% |
| Dez/25 | 34.234,57 | 40.140,78 | -5.906,21 | -14,71% |
| Jan/26 | 195.138,36 | 53.827,91 | 141.310,45 | 262,52% |

Pessoal — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 154.772,09 | 173.203,05 | -18.430,96 | -10,64% |
| Out/24 | 175.580,66 | 179.283,69 | -3.703,03 | -2,07% |
| Nov/24 | 162.198,51 | 168.727,84 | -6.529,33 | -3,87% |
| Dez/24 | 148.425,43 | 168.814,33 | -20.388,90 | -12,08% |
| Jan/25 | 160.165,72 | 192.526,41 | -32.360,69 | -16,81% |
| Fev/25 | 152.457,78 | 191.927,54 | -39.469,76 | -20,56% |
| Mar/25 | 175.510,18 | 192.572,39 | -17.062,21 | -8,86% |
| Abr/25 | 197.531,11 | 203.463,47 | -5.932,36 | -2,92% |
| Mai/25 | 198.486,37 | 192.762,75 | 5.723,62 | 2,97% |
| Jun/25 | 196.750,80 | 192.015,17 | 4.735,63 | 2,47% |
| Jul/25 | 236.759,44 | 191.933,06 | 44.826,38 | 23,36% |
| Ago/25 | 186.417,51 | 191.933,06 | -5.515,55 | -2,87% |

Pessoal — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | 202.774,68 | 204.696,38 | -1.921,70 | -0,94% |
| Out/25 | 196.470,38 | 204.696,38 | -8.226,00 | -4,02% |
| Nov/25 | 194.750,53 | 206.387,35 | -11.636,82 | -5,64% |
| Dez/25 | 210.677,01 | 204.595,35 | 6.081,66 | 2,97% |
| Jan/26 | 28.026,77 | 212.482,16 | -184.455,39 | -86,81% |

Consumo — FY25 (Set/24–Ago/25)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/24 | 3.450,29 | 4.400,00 | -949,71 | -21,58% |
| Out/24 | 3.089,31 | 4.400,00 | -1.310,69 | -29,79% |
| Nov/24 | 6.376,14 | 4.400,00 | 1.976,14 | 44,91% |
| Dez/24 | 2.998,29 | 4.400,00 | -1.401,71 | -31,86% |
| Jan/25 | 3.272,74 | 4.400,00 | -1.127,26 | -25,62% |
| Fev/25 | 4.836,73 | 4.400,00 | 436,73 | 9,93% |
| Mar/25 | 3.694,52 | 4.400,00 | -705,48 | -16,03% |
| Abr/25 | 4.721,44 | 4.400,00 | 321,44 | 7,31% |
| Mai/25 | 6.542,37 | 4.400,00 | 2.142,37 | 48,69% |
| Jun/25 | 6.806,86 | 4.400,00 | 2.406,86 | 54,70% |
| Jul/25 | 4.281,75 | 4.400,00 | -118,25 | -2,69% |
| Ago/25 | 4.442,68 | 4.400,00 | 42,68 | 0,97% |

Consumo — FY26 (Set/25–Jan/26)

| Mês | Real | Budget | Δ | Δ% |
|---|---:|---:|---:|---:|
| Set/25 | -315,57 | 5.000,00 | -5.315,57 | -106,31% |
| Out/25 | 5.083,24 | 5.000,00 | 83,24 | 1,66% |
| Nov/25 | 4.366,57 | 5.000,00 | -633,43 | -12,67% |
| Dez/25 | 2.015,28 | 5.000,00 | -2.984,72 | -59,69% |
| Jan/26 | 5.894,12 | 5.000,00 | 894,12 | 17,88% |

### 3.2 Quanto custa a folha vs o que a operação lucra? (SAP)

| Janela | Pessoal (Total Exer) | Pessoal / Faturamento | Pessoal / Gross Profit |
|---|---:|---:|---:|
| FY25 | 2.145.055,60 | 73,42% | 3,76x |
| FY26 YTD | 832.699,37 | 65,04% | 2,24x |

Leitura:
- A linha `Pessoal` é muito alta como % do faturamento (65–73%), consistente com operação intensiva em mão-de-obra.

### 3.3 Diferença salarial (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Headcount (registros com salário) | 49 |
| Salário base mínimo | 847,32 |
| Salário base máximo | 9.270,78 |
| Delta (max − min) | 8.423,46 |
| p10 / p50 / p90 (salário base) | 1.717,20 / 1.717,20 / 2.268,00 |

### 3.4 Serviços Gerais e “piso” (base de colaboradores)

| Métrica | Valor |
|---|---:|
| Pessoas em cargos com “Serviços Gerais” | 1 |
| % do quadro em “Serviços Gerais” | 2,04% |
| Pessoas no salário mínimo do CL | 3 |
| % do quadro no salário mínimo do CL | 6,12% |
| Piso (excluindo aprendizes) | 1.717,20 |
| % no piso (excluindo aprendizes) | 84,78% |

Leitura:
- Neste CL, o “piso” (min salário) parece estar associado a aprendizes (na base), e “Serviços Gerais” não é a maior parte do quadro.

### Rastreabilidade (INOVAT SP SOFT - FM)
- SAP Real:
  - `evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR016517_INOVAT_SP_SOFT_-_FM.csv`
    - `*   Faturamento Líquido`: linha 11
    - `*   Pessoal`: linha 59
    - `**  Gross Profit Exc. IFRS16`: linha 108
- Base de colaboradores:
  - `evidencias/blobs/csv/Base Frontline Experimento/BASE-Tabela 1.csv` (filtrar `Ccusto=BR016517`; coluna `Cargo`; coluna `Salario Base`)

---

## Lacunas acionáveis (para fechar a resposta com mais precisão)

1. Confirmar se as linhas de GP e faturamento devem ser lidas em **valor absoluto** (sinal SAP) e se há algum ajuste IFRS16/bonificações que esteja distorcendo a leitura em FY26 YTD, especialmente para `BR012302`.
2. Validar se `*   Pessoal` no SAP inclui todos os componentes de custo de pessoas comparáveis entre CLs.
3. Refinar “Serviços Gerais” com um dicionário por `Cd Cargo` (mais robusto que texto).
4. Definir “custo real” como DRE completa (incluindo demais linhas relevantes) caso a decisão executiva dependa disso.
