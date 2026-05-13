---
eixo: "Estrutura cliente"
observacao: "Precisamos mudar o mecanismo de cobrança. Nao podemos executar, mas podemos cobrar. Integrar a I-06 junto com essa."
tarefas: []
iniciativas_relacionadas: []
---
# Argumentário — I-03 — Manutenção de Equipamentos de Infraestrutura do cliente

## Tese (o que defender)

Instituir protocolo de aplicação de multa no cliente por SLA descumprido: registro de chamado → SLA acordado entre as partes → estouro de SLA → aplicação de multa via aditivo contratual. A GU não negocia diretamente — um diretor atua como agente de pressão, blindando a relação local e garantindo que a cobrança não vire conflito político.

## O que os dados provam

- Existe governança contratual ativa e uso de instrumento formal para reajuste e faturamento retroativo, o que indica que mecanismos formais são o canal correto para responsabilização e destrave de pendências.

> "O objeto deste Aditivo é a formalização da negociação (...) acerca do reajuste contratual".

> "A emissão do faturamento retroativo desde maio 2022, corresponde ao importe de R$ 161.264,82".

- Premissas e números relevantes para gestão do contrato não estão consolidados no roteiro e dependem de troca externa por e-mail e responsáveis específicos, o que reforça a necessidade de rito formal para cobrar e registrar decisões.

> "Valor anual do contrato | Enviado e-mail | Enviado e-mail | Enviado e-mail".

> "Margem Bruta contratada (GM target) | PFP (Juliana Vieceli) | PFP (Juliana Vieceli) | PFP (Juliana Vieceli)".

## O que os dados sugerem (mas não provam)

- Uma notificação bem desenhada, com prazos e evidência de conclusão, tende a reduzir backlog de itens críticos de manutenção ao criar trilha e consequência de escalonamento.
- Ao reduzir improviso por falhas recorrentes, pode reduzir retrabalho, paradas operacionais e incidentes com potencial de passivo.

## O que falta validar (lacunas)

- Definir perímetro mínimo de itens notificáveis e critério de criticidade.
- Definir SLAs por criticidade e formato do “aceite” do cliente.
- Definir sponsor do lado do cliente e regra de escalonamento.
- Definir repositório simples para evidências de conclusão e auditoria do backlog.

## Objeções prováveis (board / jurídico / cliente)

- "Multar o cliente vai destruir o relacionamento e o NPS."
- "A GU não tem cacife para aplicar multa — vira conflito pessoal."
- "O jurídico do cliente pode questionar a base contratual da multa."
- "Sem SLA claro, a multa vira disputa sobre o que foi acordado."

## Respostas (com base em evidências)

- O contrato já opera com formalização de reajuste e faturamento retroativo, mostrando que o instrumento formal é o canal correto. A multa é extensão desse mecanismo.
- A GU não negocia — um diretor é o agente de pressão. Isso preserva a relação local e transfere o ônus político para quem tem alçada.
- SLA e perímetro mínimo são definidos previamente, eliminando margem para disputa sobre o que estava acordado.
- O contrato vigente já prevê aplicação de multa em caso de descumprimento — a base contratual existe; o que falta é ativar e operacionalizar o gatilho.

## Viabilidade prática

- Execução (recursos/rotina):
  - Definir SLA entre as partes por criticidade.
  - GU registra chamado no cliente e acompanha prazo.
  - Diretor aciona notificação de multa se SLA estourar.
  - Registrar evidência de conclusão e escalonamento.
- Governança (quem decide/mede):
  - Diretor como agente de pressão e aplicador da multa.
  - GU como dono do rito de registro e acompanhamento.
  - SLA e perímetro mínimo definidos no contrato.
- Custo (capex/opex):
  - Baixo custo direto.
  - Principal custo é tempo de rotina e follow-up.
- Dependências (cliente/contrato):
  - Base contratual para aplicação de multa.
  - Alinhamento de SLA e responsabilidades entre as partes.

## Riscos e efeitos colaterais

- Pode aumentar tensão com o cliente se for feito sem perímetro e sem sponsor.
- Se os itens forem muitos, vira fila impossível de acompanhar e perde força.

## Checagem S1 (âncoras e força)

- Âncoras **Provado** (2):
  - Contrato formaliza reajuste e faturamento retroativo.
    - `evidencias/pdfs/text/ocr/Leroy Merlin_Food_4º Aditivo - (2023) assinado_ocr.txt`, linhas 64–80.
  - Roteiro registra dependências externas para valor anual e GM target.
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 15–20.

- Âncoras **Sustentado qualitativamente** (1):
  - Dependência de pessoas e canais externos para premissas-chave reforça necessidade de rito formal.
    - `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 29–34.

## Referências principais

- `evidencias/pdfs/text/ocr/Leroy Merlin_Food_4º Aditivo - (2023) assinado_ocr.txt`, linhas 64–80.
- `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 15–20.
- `evidencias/indice/tabelas/b6495e4d-3278-47a5-8ab8-a069fe99c6f5/table_2.md`, linhas 29–34 (answer_ids e field_ids das células de “Valor anual do contrato” e “GM target”).
