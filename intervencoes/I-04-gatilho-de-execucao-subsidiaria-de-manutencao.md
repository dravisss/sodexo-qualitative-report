# I-04 — Gatilho de Execução Subsidiária de Manutenção

## Identificação

- Intervenção: `I-04`
- Unidade(s): Cajamar Food
- Frente: Reestruturação

## O que importa aqui

- Em contratos com mecanismos de reajuste e retroativos, falhas recorrentes de infraestrutura/manutenção viram disputa difusa e custo oculto.
- A notificação formal cria trilha e marco de responsabilização, reduzindo risco operacional e jurídico quando a operação depende de infraestrutura do cliente.
- A intervenção é rápida: define perímetro mínimo de itens e prazos, e força priorização executiva do lado do cliente.

## O que está provado vs. o que é hipótese

- Provado:
  - Existe formalização contratual de reajuste e faturamento retroativo em Leroy Cajamar, mostrando governança contratual ativa e relevância de mecanismos formais.
  - O próprio roteiro indica dependências externas para valores anuais e GM target, reforçando que o rito formal importa.
- Hipótese a validar em execução:
  - Uma notificação bem desenhada, com perímetro, prazos e evidência de conclusão, reduz pendências críticas de manutenção e diminui improviso operacional.

## Tensão / Objetivo / Impacto — doc 08

- Tensão: Equipamentos críticos parados por inércia da manutenção do cliente. A GU não cobra formalmente por medo de conflito político ("NPS").
- Descrição: Instituir protocolo de "Execução Subsidiária": registro de chamado -> estouro de SLA (48h) -> Sodexo executa reparo -> Cobrança automática no faturamento (Aditivo de Service Level).
- Objetivo: Garantir continuidade operacional sem depender da boa vontade da manutenção do cliente e sem expor politicamente a gerência local.
- Impacto: Reduz tempo de equipamento parado e transfere o ônus da ineficiência para quem de fato falhou (cliente), preservando a relação comercial local.

## Descrição

Notificação formal para o cliente, enviada por canal definido no contrato, para destravar execução e responsabilização.
O objetivo é transformar uma pendência recorrente de manutenção em obrigação com prazo, dono e evidência de conclusão.

Na prática, o time consolida uma lista curta de itens críticos que impedem operação ou elevam risco.
Cada item entra já com criticidade, prazo proposto e o que será aceito como evidência de conclusão.
O cliente responde aceitando o prazo, propondo alternativa ou recusando com justificativa.
Esse retorno vira trilha, e as pendências passam a ser acompanhadas até conclusão ou escalonamento.

Como funciona:
- Definição de escopo: lista curta de itens críticos, com critério de criticidade.
- Prazo e SLA: um prazo por item e um SLA por faixa de criticidade.
- Evidência de conclusão: regra objetiva do que conta como concluído, por exemplo, foto, ordem de serviço ou aceite.
- Escalonamento: se o prazo expirar, escalona para o sponsor do contrato e registra a decisão.

## Evidências — citações e leitura

### Evidência 1 — Reajuste e retroativo formalizados — Leroy Cajamar

> O objeto deste Aditivo é a formalização da negociação do reajuste contratual, vigente desde maio/2022, no importe de 10%. A emissão do faturamento retroativo desde maio 2022 corresponde ao importe de R$ 161.264,82

Leitura:
- O contrato já opera com mecanismos formais de reajuste e retroativo. Isso sustenta que um instrumento formal de notificação é o canal adequado para destravar execução e responsabilidades.

### Evidência 2 — Dependência externa para anual e GM target — necessidade de rito

> Valor anual do contrato | Enviado e-mail | Enviado e-mail | Enviado e-mail
>
> Margem Bruta contratada GM target | PFP Juliana Vieceli | PFP Juliana Vieceli | PFP Juliana Vieceli

Leitura:
- Premissas-chave, anual e GM target, não estão consolidadas no próprio roteiro. Isso reforça que governança e formalização com cliente são parte do mecanismo de gestão.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: há evidência direta de governança contratual e de dependência externa no roteiro; a eficácia específica da notificação para reduzir pendências é hipótese operacional a validar no piloto.

## Lacunas — viabilidade e execução

- Definir perímetro mínimo de itens notificáveis, top 10, e seus SLAs por criticidade.
- Definir sponsor do lado do cliente e do lado Sodexo e regra de escalonamento.
- Definir modelo de evidência de conclusão e repositório simples de registro.

## Métricas possíveis

- Turnover: não é métrica primária, efeito indireto.
- Absenteísmo / INSS: indireto.
- Risco jurídico/passivo: número de itens críticos sem atendimento dentro do SLA; número de incidentes com potencial NR.
- Operação/qualidade: horas de parada / retrabalho por falha de infraestrutura; backlog aberto vs fechado por mês.

## Riscos / Pré-condições

- Pré-condição: alinhamento mínimo de escopo contratual do que é responsabilidade do cliente vs operação.
- Risco: notificação sem sponsor vira “ritual sem execução”; precisa de regra de escalonamento.

## Próximos passos — Fase 4 → 5

- Redigir minuta padrão de 1 página e aplicar no contrato Leroy Cajamar como piloto.
- Converter resposta do cliente em backlog com evidências de fechamento.

## Apêndice — Rastreabilidade — para auditoria

- Evidência 1:
  - fonte: Leroy Merlin — 4º Aditivo 2023
  - referência completa: path + linhas/IDs
    - `evidencias/pdfs/text/ocr/Leroy Merlin_Food_4º Aditivo - (2023) assinado_ocr.txt`, linhas 64–80
- Evidência 2:
  - fonte: Tabela do roteiro — faturamento e margem
  - referência completa: path + linhas/IDs
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 15–20
