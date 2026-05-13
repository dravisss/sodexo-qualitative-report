---
eixo: "Redimensionamento"
observacao: "Objetivo é dar visibilidade da gravidade do subdimensionamento e que o NEO esta endereçando isso. A saida é entender qual prioridade e velocidade conseguimos atribuir."
tarefas: []
iniciativas_relacionadas: []
---
# Argumentário — I-18 — Revisão do quadro pela demanda real

## Tese (o que defender)

Criar modelo de dimensionamento baseado em volumetria de catraca (já medida: 990 acessos/dia Cajamar) e picos de serviço. Regra: se demanda subir >10% por 2 meses, gatilho automático de revisão de quadro. Se equipamento quebrar (I-03), ajustar quadro proporcionalmente ou consertar em 15 dias. Governança mensal GU + Cliente para sincronizar.

## O que os dados provam

- **Desequilíbrio Extremo:** Há uma disparidade crítica de turnover entre unidades, com GRU FM atingindo 119,22% ao ano, enquanto Cajamar Food opera com 57,51% (`evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md` linhas 15-22).
- **Mecânica de Dimensionamento:** O contrato Leroy Cajamar já prevê gatilhos de faturamento mínimo e custo fixo, provando que o dimensionamento deve ser sincronizado com a demanda do cliente para não gerar prejuízo (`evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf.txt` linhas 143-156).
- **Dados Disponíveis:** A operação já coleta dados de catraca (990 acessos reportados em Cajamar) que servem como baseline para o modelo de demanda (`evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_3.md` linhas 17-20).

## O que os dados sugerem (mas não provam)

- O subdimensionamento em GRU FM pode ser uma das causas da explosão de turnover, criando um ciclo onde quem fica não aguenta a carga dos que saíram.
- A GU não solicita revisão de quadro por acreditar que o orçamento é "estático", ignorando que a demanda real pode ter mudado desde a assinatura do contrato.

## O que falta validar (lacunas)

- Identificar o "driver" principal de esforço por unidade (ex: complexidade de limpeza no FM vs volumetria no Food).
- Mapear a curva de produtividade ideal (refeições/homem-hora) para cada arquétipo de unidade.

## Objeções prováveis (board / jurídico / cliente)

- **"Revisar quadro para cima vai destruir a margem contratada."**
- **"O cliente não vai aceitar pagar por mais gente no cenário atual."**

## Respostas (com base em evidências)

- **Resposta à margem:** O custo real do turnover de 119% (recrutamento, uniformes, treinamento, baixa produtividade nos primeiros 45 dias) é superior ao ajuste de headcount estável.
- **Resposta ao cliente:** A revisão baseada em dados de catraca e SLAs de produção (tempo de fila) é técnica e amparada pelo contrato. Equipamentos quebrados (I-03) muitas vezes mascaram a necessidade real de gente.

## Viabilidade prática

- **Execução (recursos/rotina):** Rito mensal de "Check de Dimensionamento" cruzando catraca vs escala.
- **Governança (quem decide/mede):** GU + Planejamento Operacional + Cliente (para validação de demanda).
- **Custo (capex/opex):** Potencial aumento de Opex, compensado pela redução de horas extras emergenciais e turnover.
- **Dependências (cliente/contrato):** Acesso transparente aos dados de volume do cliente.

## Riscos e efeitos colaterais

- **Engessamento Operacional:** Um modelo muito rígido pode não responder a picos sazonais. Exige reserva técnica planejada (I-13).

## Referências principais

- `@/Users/Ravi/Apps/Qualitative Analyst/publish-site/evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md`
- `@/Users/Ravi/Apps/Qualitative Analyst/publish-site/evidencias/pdfs/text/Leroy Merlin/Leroy Merlin_Food_Proposta - (2020) assinada.pdf.txt`
- `@/Users/Ravi/Apps/Qualitative Analyst/publish-site/intervencoes/I-18-revisao-do-quadro-pela-demanda-real.md`
