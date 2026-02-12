# I-21 — Revisão do quadro pela demanda real

## Identificação

## Tese (o que defender)

Instituir a "Lei de Capacidade Operacional" (FTE = f(refeições/pico, complexidade, equipamento)), onde o quadro se ajusta trimestralmente à demanda real medida, não ao orçamento estático aprovado no ano anterior. Transformar a revisão de quadro de "negociação política" em "engenharia de sistemas".

- Intervenção: `I-21`
- Unidade(s): Cajamar Food | Guarulhos Food | Guarulhos FM
- Frente: Reestruturação

## O que importa aqui

- Há forte assimetria entre unidades em headcount e turnover; revisar “quadro” sem amarrar a demanda real tende a perpetuar sobrecarga e rotatividade.
- O contrato pode impor mínimos e custos fixos (ex.: Leroy Cajamar), então subdimensionamento/superdimensionamento vira risco financeiro e operacional.
- A revisão precisa virar mecanismo: regra de dimensionamento + rotina de atualização + governança com cliente (quando a demanda é exógena).

## O que está provado vs. o que é hipótese

- Provado:
  - existem valores reportados de headcount e turnover anual por unidade (tabela do roteiro).
  - o contrato Leroy Cajamar descreve mecanismo de faturamento mínimo e cobrança de custo fixo em caso de queda.
- Hipótese (a validar em execução):
  - ajustar quadro com base em demanda real reduz turnover e incidentes operacionais (efeito sistêmico esperado, mas depende do piloto e do rito).

## Tensão / Objetivo / Impacto (doc 08)

- quadro necessário (por função)
e institucionalizar uma rotina mensal de ajuste e negociação com cliente quando houver desalinhamento.

## Evidências (citações + leitura)

### Evidência 1 — Headcount e turnover anual variam fortemente por unidade

> “Headcount total (PJ + CLT) | 24 | 24 | 57”
>
> “Turnover anual (%) | 57,51% | 41,54% | 119,22%”

Leitura:
- Existe assimetria grande de quadro e rotatividade (GRU FM muito acima). Isso sustenta que “quadro” é variável central do sistema e precisa ser amarrado a capacidade/demanda (não só orçamento).

### Evidência 2 — Contrato pode impor mínimo e custo fixo (impacto direto do dimensionamento)

> “Faturamento mínimo mês 1ª FASE MAIO: R$ 191.894,04”
>
> “Caso haja uma redução igual ou superior a 10% (...) serão cobrados 50% (...) de custo fixo (...) sobre a diferença entre o faturamento bruto mínimo previsto e o faturamento bruto realizado”

Leitura:
- Se existe mínimo/custo fixo, o quadro não pode ser dimensionado “no escuro”: desalinhamento demanda↔capacidade↔quadro vira custo e risco operacional.

### Evidência 3 — Premissas contratuais/GM não estão consolidadas localmente

> “Valor anual do contrato | Enviado e-mail | Enviado e-mail | Enviado e-mail”
>
> “Margem Bruta contratada (GM target) | PFP (Juliana Vieceli) | PFP (Juliana Vieceli) | PFP (Juliana Vieceli)”

Leitura:
- Parte das premissas financeiras chave (anual/GM target) depende de rito externo. Isso reforça que o mecanismo de revisão de quadro precisa ser governado e rastreável.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: dados reportados + mecanismo contratual são evidências diretas; o efeito em turnover exige execução controlada para validar.

## Lacunas (viabilidade/execução)

- Definir qual será o “driver” principal de demanda por unidade (refeições/dia, picos por turno, sazonalidade) e como coletar.
- Traduzir demanda em quadro por função (cozinha, limpeza, estoque, liderança) com regra simples e auditável.
- Definir como a revisão mensal vira decisão (quem aprova, qual janela, qual impacto permitido).

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: desligamentos no mês dividido por headcount médio do mês; janela mensal com visão trimestral.
  - Fonte provável: RH/folha; baseline adicional no acervo via `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md` (turnover anual reportado).
  - Observação: o efeito pode ter defasagem e depender de outras intervenções de torniquete.
- Absenteísmo / INSS:
  - Definição operacional mínima: absenteísmo mensal médio e contagem de afastamentos INSS ativos; janela mensal.
  - Fonte provável: ponto/RH; baseline no acervo via `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md`.
  - Observação: acompanhar em paralelo horas extras e cobertura de faltas, porque podem mascarar subdimensionamento.
- Risco jurídico/passivo:
  - Definição operacional mínima: número de ocorrências formais por desvio de função e por condições inseguras associadas a sobrecarga; janela trimestral.
  - Fonte provável: SESMT, jurídico trabalhista, auditorias.
  - Observação: sem baseline no acervo atual; usar como monitoramento.
- Operação/qualidade:
  - Definição operacional mínima: volumetria por turno e falhas operacionais registradas, e variação de produtividade aproximada (refeições por hora trabalhada, quando possível); janela semanal/mensal.
  - Fonte provável: registros operacionais da unidade, escala/folha, relatórios do cliente.
  - Observação: depende de definir o “driver” de demanda no piloto.

## Riscos / Pré-condições

- Pré-condição: ter uma medida mínima de demanda real (sem isso vira “debate de opinião”).
- Risco: revisão de quadro virar disputa sem critério; precisa de regra e dados.

## Próximos passos (Fase 4 → 5)

- Escolher 1 unidade piloto e rodar 60 dias com revisão mensal (medir antes/depois).
- Conectar ajuste de quadro ao backlog de infraestrutura (quando gargalo não é gente, é equipamento/processo).

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: Tabela do roteiro — quadro e indicadores
  - referência completa (path + linhas/IDs):
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md`, linhas 15–22
- Evidência 2:
  - fonte: Leroy Merlin — Proposta 2020 (texto extraído)
  - referência completa (path + linhas/IDs):
    - `evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf.txt`, linhas 143–156
 - Evidência 3:
  - fonte: Tabela do roteiro — faturamento e margem
  - referência completa (path + linhas/IDs):
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 15–20
