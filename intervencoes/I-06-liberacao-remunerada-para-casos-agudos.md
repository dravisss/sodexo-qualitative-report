# I-06 — Liberação remunerada para casos agudos

## Identificação

- Intervenção: `I-06`
- Unidade(s): Cajamar | Guarulhos Food | Guarulhos FM
- Frente: Torniquete

## O que importa aqui

- O sistema atual cria incentivo para trabalhar doente, o que piora produtividade, aumenta risco sanitário e eleva conflito com liderança.
- Esta intervenção é um mecanismo tampão enquanto a regra sistêmica de benefício e bônus não muda: liberar o trabalhador doente sem perda integral de renda.
- O acervo já registra que regras punitivas ligadas a atestado e bônus são tratadas como negociadas com sindicatos e que a alteração exige negociação.

## Tese (o que defender)

Implementar um protocolo local de liberação remunerada para casos agudos (sintomas visíveis/incapacidade operacional), com registro e limites, como tampão enquanto a regra sistêmica de punição por atestado não muda, reduzindo presenteísmo e contágio.

## O que está provado vs. o que é hipótese

- Provado:
  - O campo descreve que incentivos financeiros penalizam faltas e que isso leva a presenteísmo, incluindo relato de alguém que trabalhou com dengue.
  - Há evidência de que a regra de perda integral do bônus por atestado é tratada como negociada com sindicatos.
  - Há evidência de que mudar a política exige negociação sindical.
- Hipótese (a validar em execução):
  - Um protocolo local de liberação remunerada reduz contágio e reduz escalada de conflitos, com impacto em absenteísmo e afastamentos.

## Tensão / Objetivo / Impacto (doc 08)

- Tensão: Colaboradores visivelmente doentes comparecem ao trabalho para não perderem a renda variável integral, operando com baixa produtividade e risco.
- Objetivo: Criar um mecanismo local de afastamento remunerado para casos agudos enquanto a regra sistêmica não muda.
- Impacto esperado: Proteger a equipe do contágio e reduzir tensão com chefia ao permitir liberação sem punição.

## Descrição (doc 08, com adaptações)

O protocolo precisa ser simples e aplicável na ponta, sem depender de atestado em tempo real.

Mecanismo proposto:

- A liderança local identifica sintomas visíveis de incapacidade operacional e risco de contágio.
- O colaborador é liberado com um registro interno de “liberação operacional”, sem caracterizar falta injustificada.
- A liberação preserva a renda variável do ciclo conforme regra definida, com limite de eventos por período e gatilhos de escalonamento para medicina do trabalho.

Governança mínima:

- Entradas: observação do estado do colaborador, relato do próprio colaborador, histórico de liberação.
- Decisão: GU ou liderança designada.
- Saídas: registro interno, cobertura de turno, encaminhamento para atendimento quando necessário.

Esta intervenção deve ser implementada junto com um ajuste de regra corporativa ou negociação sindical para evitar que vire exceção informal e contestável.

## Evidências (citações + leitura)

### Evidência 1 — Evidência de presenteísmo induzido por punição e medo, incluindo caso de dengue

> "O sistema de incentivos financeiros penaliza faltas, e há um receio generalizado de sofrer transferências arbitrárias ou ameaças ao apresentar atestados. Isso cria um dilema onde o trabalhador é desencorajado a se afastar quando doente, levando a situações como a de quem \"trabalhou com dengue\"."

Leitura:
- O campo descreve o mecanismo de presenteísmo como resultado de regra e medo de punição.

### Evidência 2 — Regra punitiva por atestado é tratada como negociada com sindicatos

> "Negociada com os sindicatos"

Leitura:
- Isso indica que a solução estrutural da regra depende de negociação e não de decisão local.

### Evidência 3 — Procedimento correto para alterar a política é negociação com sindicato

> "Nova negociação com o sindicato"

Leitura:
- O acervo explicita o caminho formal de mudança, o que orienta pré-condições de viabilidade.

## Força da evidência

- Classificação: Sustentado qualitativamente
- Observação: Há evidência qualitativa do campo sobre presenteísmo e há evidência direta do banco sobre o caráter negociado da regra e o caminho de mudança. Falta evidência quantitativa direta de incidência de presenteísmo e de contágio.

## Lacunas (viabilidade/execução)

- Definir limite e critérios do que configura “caso agudo” e quem decide.
- Definir como preservar renda variável sem abrir espaço para fraude.
- Definir como o protocolo se integra com medicina do trabalho, CAT e INSS quando aplicável.
- Definir métrica e critério de sucesso do piloto em 60 a 90 dias.

## Métricas possíveis

- Turnover:
  - Definição operacional mínima: desligamentos no mês dividido por headcount médio do mês; janela mensal.
  - Fonte provável: RH/folha.
  - Observação: efeito indireto.
- Absenteísmo / INSS:
  - Definição operacional mínima: absenteísmo mensal médio e contagem de afastamentos INSS ativos; janela mensal.
  - Fonte provável: sistema de ponto/RH; baseline no acervo via `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_0.md`.
  - Observação: no curto prazo pode haver aumento de ausências formais se o presenteísmo cair.
- Risco jurídico/passivo:
  - Definição operacional mínima: número de casos contestados de desconto/punição vinculados a ausência por saúde; janela trimestral.
  - Fonte provável: jurídico e relações sindicais.
  - Observação: sem baseline no acervo; usar como monitoramento.
- Operação/qualidade:
  - Definição operacional mínima: número de liberações operacionais por semana/mês e tempo até reposição de cobertura de turno; janela semanal/mensal.
  - Fonte provável: registro do protocolo de liberação + escala.
  - Observação: métrica principal do piloto por medir uso e governança do mecanismo.

## Riscos / Pré-condições

- Sem formalização e alinhamento com sindicato, pode gerar insegurança jurídica e contestação.
- Sem limite e registro, pode ser percebido como injusto e gerar seleção adversa interna.

## Próximos passos (Fase 4 → 5)

- Desenhar e validar o protocolo com jurídico e relações sindicais.
- Rodar piloto com registro de liberações, motivo e cobertura de turno.

## Apêndice — Rastreabilidade (para auditoria)

- Evidência 1:
  - fonte: síntese de campo
  - referência completa (path + linhas/IDs): `Refined/mapeamento_tensoes_intervencoes.md` linhas 146–148.
- Evidência 2:
  - fonte: banco, resposta textual
  - referência completa (path + linhas/IDs): `evidencias/banco/answers.json` linhas 399–408; `submission_id=b6495e4d-3278-47a5-8ab8-a069fe99c6f5`, `field_id=question_27`.
- Evidência 3:
  - fonte: banco, resposta textual
  - referência completa (path + linhas/IDs): `evidencias/banco/answers.json` linhas 423–432; `submission_id=b6495e4d-3278-47a5-8ab8-a069fe99c6f5`, `field_id=question_29`.
