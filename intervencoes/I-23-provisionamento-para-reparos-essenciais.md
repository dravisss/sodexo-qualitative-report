# I-23 — Provisionamento para Reparos Essenciais

## Identificação

- Intervenção: `I-23`
- Frente: Reestruturação
- Unidade(s): Todas
## Tese (o que defender)

Criar "Reserva Protegida para Conformidade" (linha orçamentária blindada e auditável), reconhecendo que itens de conformidade não podem competir com outras despesas no curto prazo sob pena de gerar passivo oculto (NR/CLT) que custa 10x mais depois.

- Intervenção: `I-23`
- Unidade(s): Cajamar Food | Guarulhos Food | Guarulhos FM
- Frente: Reestruturação

## O que importa aqui

- Itens essenciais (EPI/uniformes e manutenção crítica) não podem competir com o “resto do orçamento” no curto prazo sem gerar risco jurídico/operacional.
- Há evidência de desvio Real vs Plan em EPI/Uniformes (Leroy Cajamar), sugerindo que o mecanismo atual de budget não protege o essencial.
- Uma verba carimbada com regras simples (o que entra, limites, comprovação) reduz improviso e evita que risco vire passivo.

## O que está provado vs. o que é hipótese

- Provado:
  - existe desvio Real vs Plan em EPI/Uniformes em Leroy Cajamar no comparativo SAP.
  - o roteiro reporta custo mensal médio de uniformes/EPIs por unidade (ordem de grandeza).
- Hipótese (a validar em execução):
  - criar verba carimbada com governança (regras + evidência de uso) reduz rupturas de suprimento e incidentes de conformidade.

## Tensão / Objetivo / Impacto (doc 08)

- **Tensão:** Pequenos reparos (torneiras, tomadas) são ignorados por falta de verba imediata, degradando o ambiente e gerando multas maiores no futuro.
- **Descrição:** Estabelecer linha de **Provisionamento Mandatório para Manutenção** no orçamento. A verba deve ser carimbada para conservação predial e equipamentos, blindada de cortes para atingimento de meta de lucro puramente financeiro.
- **Objetivo:** Garantir a conservação do ativo e as condições de trabalho.
- **Impacto:** Ambientes de trabalho funcionais e dignos, reduzindo o estresse operacional causado por infraestrutura quebrada.

## Descrição (doc 08, com adaptações)

Criar um mecanismo de verba carimbada por unidade (ou por contrato) com:
- lista de itens elegíveis (ex.: EPIs/uniformes, reparos essenciais)
- limites e alçadas
- regra de evidência (NF/OS/foto/aceite)
- acompanhamento mensal (consumo vs plano)

## Evidências (citações + leitura)

### Evidência 1 — Desvio Real vs Plan em EPI/Uniformes (Leroy Cajamar)

> “TOTAL,30772.45,24000,6772.450000000001”

Leitura:
- Existe desvio material no comparativo Real vs Plan para EPI/Uniformes. Isso sustenta a necessidade de um mecanismo que proteja o essencial e reduza variação “na marra”.

### Evidência 2 — O roteiro já reporta custo mensal médio de EPIs/uniformes

> “Custo médio mensal de uniformes e EPIs | 38.294,93 | 1800,00 | 3.000,00”

Leitura:
- Há baseline reportado de custo mensal por unidade. Isso permite dimensionar (ordem de grandeza) a verba carimbada e acompanhar execução.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: o desvio e o custo reportado são evidências diretas; o efeito em risco/turnover depende de implementação e acompanhamento.

## Lacunas (viabilidade/execução)

- Definir escopo do que conta como “essencial” (lista curta, não expansível por conveniência).
- Definir alçada e SLA de compra/execução para não travar operação.
- Definir mecanismo de comprovação e auditoria simples (sem burocracia excessiva).
- Confirmar período coberto pelo comparativo Real vs Plan para calibrar metas.

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: desligamentos no mês dividido por headcount médio do mês; janela mensal.
  - Fonte provável: RH/folha.
  - Observação: efeito indireto.
- Absenteísmo / INSS:
  - Definição operacional mínima: absenteísmo mensal médio e contagem de afastamentos INSS ativos; janela mensal.
  - Fonte provável: ponto/RH.
  - Observação: efeito indireto e com defasagem.
- Risco jurídico/passivo:
  - Definição operacional mínima: número de não conformidades e incidentes relacionados a EPI e infraestrutura e backlog crítico fora do SLA; janela mensal.
  - Fonte provável: SESMT, auditorias do cliente, registros de manutenção.
  - Observação: sem baseline no acervo atual; usar como monitoramento.
- Operação/qualidade:
  - Definição operacional mínima: paradas por manutenção crítica e tempo médio de atendimento de chamados críticos; janela semanal/mensal.
  - Fonte provável: ordens de serviço e registro de chamados.
  - Observação: acompanhar também ruptura de itens essenciais quando fizer parte da lista elegível.

## Riscos / Pré-condições

- Pré-condição: consenso de que “essencial” tem prioridade sobre outras despesas.
- Risco: a verba carimbada virar “caixa paralelo” sem critérios; precisa de lista e trilha.

## Próximos passos (Fase 4 → 5)

- Piloto em 1 unidade (Cajamar): definir lista de itens, teto mensal e rito de prestação de contas.
- Revisar após 60 dias: taxa de incidentes, rupturas e execução vs plano.

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: SAP (CSV) — Real vs Plan EPI/Uniformes (Leroy Cajamar)
  - referência completa (path + linhas/IDs):
    - `evidencias/blobs/csv/sap/Dados_SAP_Real_x_Budget_EPI_e_Unif_FY25/BR014545_LEROY_MERLIN_CAJAMAR.csv`, linha 7
- Evidência 2:
  - fonte: Tabela do roteiro — custos operacionais e insumos
  - referência completa (path + linhas/IDs):
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_1.md`, linhas 15–21
