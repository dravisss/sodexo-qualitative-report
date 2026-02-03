# I-20 — Saída voluntária sem punir quem fica

## Identificação

- Intervenção: `I-20`
- Unidade(s): Cajamar | Guarulhos Food | Guarulhos FM
- Frente: Reestruturação

## O que importa aqui

- A saída “honrosa” é um mecanismo para desfazer travamento rescisório sem destruir o incentivo de quem fica.
- A evidência disponível não prova o custo real por unidade, mas prova a existência de um modelo interno de decomposição do custo rescisório e ordens de grandeza por perfil.
- Se a rescisão for debitada no lugar errado, ela vira veto invisível a desligamentos, retendo pessoas que querem sair e degradando clima e produtividade.

## O que está provado vs. o que é hipótese

- Provado:
  - Existe um modelo estruturado de decomposição do custo rescisório (inclui aviso prévio, multa FGTS, encargos e componentes “não provisionados”).
  - A simulação tem exemplos sintéticos com ordens de grandeza explícitas por tempo de casa.
- Hipótese (a validar em execução):
  - Blindar o impacto da saída voluntária para não punir quem fica reduz travamento e melhora clima e estabilidade.

## Tensão / Objetivo / Impacto (doc 08)

- Tensão: Impasse onde a empresa não demite pelo custo e o funcionário não pede conta para não perder FGTS, gerando ambiente tóxico.
- Objetivo: Facilitar a saída honrosa e negociada de colaboradores que querem sair, sem sangrar o resultado da unidade e sem punir quem fica.
- Impacto esperado: Reduzir retenção forçada e limpar clima organizacional de insatisfeitos crônicos.

## Descrição (doc 08, com adaptações)

O mecanismo precisa separar três coisas:

- decisão de saída
- custo de saída
- incentivo de quem fica

Como funciona:

- Criar um pacote padronizado de saída voluntária para casos elegíveis.
- Blindar o custo rescisório para não cair como “punição” no P&L local e na PLR do time remanescente.
- Definir critérios de elegibilidade e janelas, para evitar uso oportunista.

Governança mínima:

- Entrada: pedido formal do colaborador ou proposta da gestão.
- Decisão: RH + jurídico + liderança operacional.
- Saída: termo de acordo, comunicação individual e controle de substituição.

## Evidências (citações + leitura)

### Evidência 1 — Existe decomposição explícita do custo rescisório, incluindo “custos não provisionados”

> "Aviso Prévio Indenizado"

Leitura:
- A simulação tem cabeçalho com componentes típicos do custo rescisório e distingue custos provisionados e não provisionados, o que torna a discussão operacionalizável.

### Evidência 2 — Ordem de grandeza sintética por tempo de casa (salário de referência)

> "Exemplo \"Colaborador 5 anos\" resulta em total ~R$ 17.237,64"

Leitura:
- A simulação fornece uma ordem de grandeza por perfil, útil para calibrar governança e evitar decisões locais cegas.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: o modelo e as ordens de grandeza sintéticas são provados no acervo; o efeito de saída voluntária sem punir quem fica depende de desenho do programa e governança.

## Lacunas (viabilidade/execução)

- Definir elegibilidade e janelas do programa.
- Definir onde o custo rescisório é registrado e como é blindado do P&L local e da PLR.
- Definir como a unidade repõe o quadro após adesão, para não virar choque de capacidade.
- Definir critério de sucesso do piloto em 90 dias (ex.: redução de pedidos “travados” e redução de conflitos).

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: desligamentos no mês dividido por headcount médio do mês, com recorte de voluntário/involuntário; janela mensal.
  - Fonte provável: RH/folha.
  - Observação: o programa pode aumentar turnover voluntário no curto prazo para reduzir retenção forçada.
- Absenteísmo / INSS:
  - Definição operacional mínima: absenteísmo mensal médio e contagem de afastamentos INSS ativos; janela mensal.
  - Fonte provável: ponto/RH.
  - Observação: efeito indireto via clima e sobrecarga.
- Risco jurídico/passivo:
  - Definição operacional mínima: número de disputas e contestações relacionadas a acordos de desligamento; janela trimestral.
  - Fonte provável: jurídico e relações trabalhistas.
  - Observação: monitorar qualidade do termo e adesão voluntária.
- Operação/qualidade:
  - Definição operacional mínima: tempo médio para reposição de vaga após adesão e impacto em cobertura de turnos; janela mensal.
  - Fonte provável: RH + escala.
  - Observação: métrica principal do piloto para evitar colapso operacional.

## Riscos / Pré-condições

- Se o programa não blindar PLR e P&L local, a liderança vai travar adesões.
- Se não houver reposição planejada, a saída voluntária vira subdimensionamento.

## Próximos passos (Fase 4 → 5)

- Preparar desenho do programa com critérios, trilha de aprovação e comunicação individual.
- Rodar piloto controlado por unidade, com relatório mensal de adesões e reposições.

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: nota analítica + CSV derivado (rescisão)
  - referência completa (path + linhas/IDs):
    - Nota: `evidencias/notas/RESCISAO/simulacao-aviso-previo-indenizado.analise.md` linhas 16–31.
    - CSV: `evidencias/blobs/csv/rescisao/Simulação_Aviso_Prévio_Indenizado/Simulação Aviso Prévio Indenizado.csv` linha 1 (cabeçalho).
- Evidência 2:
  - fonte: nota analítica + CSV derivado (rescisão)
  - referência completa (path + linhas/IDs): `evidencias/notas/RESCISAO/simulacao-aviso-previo-indenizado.analise.md` linhas 16–26.
