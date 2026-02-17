# Argumentário — I-32 — Auditoria de PFP (Vício de Origem em Vendas)

## Tese (o que defender)

Implementar uma barreira técnica no processo de vendas (Bid) para impedir a assinatura de contratos com dimensionamento operacional subestimado (Vício de Origem). A tese é que o turnover estrutural muitas vezes nasce na venda ("vendeu 10 pessoas, precisa de 14"), e nenhuma gestão de RH resolve um erro matemático de carga de trabalho.

## O que os dados provam

- **Sustentado qualitativamente:** Contratos novos "explodem" em hora extra e turnover nos primeiros 6 meses.
- **Padrão observado:** Comercial vende o "mundo ideal" para ganhar preço; Operação recebe o "mundo real" e quebra.

## O que os dados sugerem (mas não provam)

- Que existe um percentual relevante de contratos na carteira que são deficitários desde o D0 (Dia Zero) e nunca darão lucro sem renegociação.
- Que o custo de turnover e hora extra gerado pelo subdimensionamento anula o lucro da venda.

## O que falta validar (lacunas)

- Quem terá o "Poder de Veto"? (Operações pode vetar uma venda aprovada pelo Diretor Comercial?).
- Qual o SLA dessa auditoria para não travar a agilidade comercial?

## Objeções prováveis (Comercial / Crescimento)

- "Vocês vão travar o crescimento da empresa com burocracia".
- "A Operação sempre quer sobra de gente, o mercado não paga isso".
- "Otimização se faz na gestão, deixa entrar e a gente arruma".

## Respostas (com base em evidências)

- **Defesa de Margem:** "Vender contrato ruim não é crescimento, é inchaço e prejuízo. Estamos protegendo o EBITDA, não travando a venda. Contrato que nasce errado drena caixa de outros contratos bons."
- **Defesa Técnica:** "Não é 'querer sobra', é validar a física. Se são 1000 refeições em 2 horas, precisa de X braços. Menos que isso é burnout e passivo trabalhista. Temos dados de produtividade para balizar o veto."

## Viabilidade prática

- **Execução:**
  - Checkpoint obrigatório no fluxo de aprovação de proposta (Salesforce/Sistema).
  - Validador Técnico (perfil sênior de operações).
- **Governança:**
  - Relatório de "Contratos Vetados por Risco Operacional".
- **Custo:**
  - Custo de oportunidade (vendas não realizadas), mas com ganho de qualidade da receita.

## Riscos e efeitos colaterais

- Conflito político Diretor Comercial vs Diretor Operacional.
- Aumento do lead time de propostas.

## Checagem S1 (âncoras e força)

- **Sustentado qualitativamente:**
  - Discussão sobre contratos que "já nascem mortos".
    - `revisao/MDs War Room/Novas Intervencoes Transcricao audio 2.md`

## Referências principais

- `revisao/MDs War Room/Novas Intervencoes Transcricao audio 2.md`
