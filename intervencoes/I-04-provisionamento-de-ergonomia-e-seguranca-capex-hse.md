---
eixo: "Provisionamento"
observacao: "Precisamos mudar o texto para permitir o mapeamento de ativo para a manutençao preventiva e corretiva dos equipamentos necessarios e a compra em orçamento provisionado. Fernanda verificar se há um kit na PFP / verificar com HSE se esse item entrará na analise do consultor de segurança."
tarefas: []
iniciativas_relacionadas: []
---
# I-04 — Revisão da linha de manutenção

## Identificação

- Intervenção: `I-04`
- Frente: Torniquete
- Unidade(s): Cajamar | Guarulhos Food | Guarulhos FM
## O que importa aqui

- Quando o orçamento é curto, a pior decisão é gastar em itens periféricos e manter o núcleo ergonômico e de segurança quebrado.
- A intervenção não exige aumento imediato de verba; exige uma regra de priorização explícita para reduzir dor e risco físico.
- O acervo já traz custo médio mensal reportado de manutenção por unidade e traz evidência qualitativa de que equipamentos antigos e infraestrutura mantêm esforço excessivo.

## O que está provado vs. o que é hipótese

- Provado:
  - Há custo médio mensal reportado de manutenção por unidade.
  - O campo descreve que a infraestrutura e os equipamentos mantêm esforço excessivo.
- Hipótese (a validar em execução):
  - Uma lista corporativa de prioridade mínima de ergonomia e segurança, aplicada localmente, reduz esforço físico e conflitos, mesmo sem aumento de orçamento.

## Tensão / Objetivo / Impacto (doc 08)

- **Tensão:** Ausência de provisionamento sistemático de manutenção dos equipamentos e ergonomia.
- **Descrição:** Revisão do provisionamento das linhas de manutenção com base em necessidades de NR-17/NR-11 para garantir a segurança e a operacionalidade dos equipamentos.
- **Objetivo:** Garantir manutenção preventiva e corretiva com orçamento dedicado.
- **Impacto:** Redução de riscos trabalhistas e de segurança, equipamentos sempre operacionais.

## Descrição (doc 08, com adaptações)

A intervenção cria uma regra simples de alocação do pouco recurso disponível.

O mecanismo recomendado é:

- A GU mantém uma lista viva, revisada semanalmente, com itens de ergonomia e segurança.
- Cada item da lista precisa ter:
  - descrição do problema e onde ocorre
  - risco físico associado
  - custo estimado
  - ação possível em até 7 dias
- O orçamento disponível no mês só pode ser usado em itens dessa lista até que o backlog crítico esteja abaixo de um limiar.

Na prática, isso desloca a decisão de compra do campo subjetivo para um rito mínimo e reduz a chance de gastar em itens que não afetam dor, risco e produtividade.

## Evidências (citações + leitura)

### Evidência 1 — Custo médio mensal de manutenção por unidade é explicitamente reportado

> "Custo médio mensal de manutenção (programada + emergencial) | 1.712,23 | 1500,00 | 1.400,00"

Leitura:
- O formulário explicita um valor reportado de manutenção por unidade, o que permite discutir alocação do recurso como regra e governança.

### Evidência 2 — Infraestrutura e equipamentos mantêm esforço excessivo

> "Decisões sobre a aquisição de equipamentos ou melhorias de infraestrutura são vinculadas à meta de lucratividade (P&L) de curto prazo. Isso prioriza indicadores financeiros imediatos e adia investimentos, mantendo \"equipamentos de trabalho antigos que causam esforço excessivo\"."

Leitura:
- O campo descreve que o esforço físico excessivo não é acidente; é produzido por decisões de adiar investimento e operar com equipamento degradado.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: O custo de manutenção reportado é evidência provada; a ligação entre orçamento curto, priorização inadequada e esforço físico é sustentada por evidência qualitativa de campo. Falta evidência operacional do backlog de manutenção por item e sua severidade.

## Lacunas (viabilidade/execução)

- Definir o que entra na lista de prioridade mínima de ergonomia e segurança.
- Definir a cadência e quem aprova e quem executa a compra.
- Definir como lidar com itens que dependem de cliente ou de CAPEX.
- Definir métrica de dor e esforço percebido e critério de sucesso do piloto.

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: desligamentos no mês dividido por headcount médio do mês; janela mensal.
  - Fonte provável: RH/folha.
  - Observação: efeito indireto.
- Absenteísmo / INSS:
  - Definição operacional mínima: absenteísmo mensal médio e contagem de afastamentos INSS ativos; janela mensal.
  - Fonte provável: sistema de ponto/RH; baseline no acervo via `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md`.
  - Observação: a intervenção atua em risco e dor física, então o efeito pode aparecer primeiro em queixas e afastamentos.
- Risco jurídico/passivo:
  - Definição operacional mínima: número de ocorrências de segurança e ergonomia registradas e não resolvidas; janela mensal.
  - Fonte provável: SESMT, auditorias e livro de ocorrências.
  - Observação: não há baseline no acervo; usar como monitoramento.
- Operação/qualidade:
  - Definição operacional mínima: backlog de itens ergonômicos e de segurança classificados como críticos e tempo médio de resolução; janela semanal/mensal.
  - Fonte provável: lista viva da intervenção + registros de compra/ordem de serviço.
  - Observação: métrica diretamente controlável e recomendada para o piloto.

## Riscos / Pré-condições

- Se a regra não for explícita, o orçamento tende a ser capturado por urgências periféricas e o núcleo ergonômico segue sem solução.
- Se não houver canal de escalonamento para itens que dependem de cliente, a lista vira frustração.

## Próximos passos (Fase 4 → 5)

- Montar lista inicial por unidade e classificar os itens por risco e urgência.
- Rodar piloto de 60 dias com revisão semanal e relatório de itens resolvidos e pendentes.

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: formulário, tabela derivada
  - referência completa (path + linhas/IDs): `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_1.md` linhas 15–20; célula `field_id=table_1_row_2_col_1/_col_2/_col_3`.
- Evidência 2:
  - fonte: síntese de campo
  - referência completa (path + linhas/IDs): `Refined/mapeamento_tensoes_intervencoes.md` linhas 78–80.
