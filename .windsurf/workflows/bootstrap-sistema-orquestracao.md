---
name: bootstrap-sistema-orquestracao
description: Bootstrap socrático + pesquisa ativa para criar ORCHESTRATOR/STATUS/workflows/skills customizados por projeto
---

# Workflow — Bootstrap de sistema de orquestração (custom por projeto)

## Objetivo

Criar, de forma rápida e iterativa (estilo “terminal app”), um sistema de orquestração para um projeto novo, incluindo:

- Prompt-mãe (`ORCHESTRATOR.md` ou regra always-on)
- Memória operacional (`STATUS.md`)
- Workflows (rotinas repetíveis por fase)
- Skills (técnicas pontuais acionáveis)

O processo combina **pesquisa ativa do assistente no repositório** com um fluxo **socrático curto** baseado em **opções numeradas** para o usuário escolher/refinar.

## Princípios

- **Pesquisa ativa primeiro**: o assistente deve ler o repo antes de “interrogar” o usuário.
- **Menos perguntas, mais propostas**: sempre oferecer 2–5 opções numeradas `[1] [2] [3] ...`.
- **Rastreabilidade por design**: claims relevantes exigem referência (path/ID/trecho).
- **Separar fato de hipótese**: todo output operacional exige classificação (provado/sustentado/hipótese/lacuna) quando aplicável.
- **Gate de confirmação**: antes de escrever/alterar muitos arquivos, apresentar um plano curto + pedir confirmação.

---

# Etapa 0 — Warm start (pesquisa ativa no repo)

## Ações do assistente (sem perguntar nada ainda)

1. Mapear estrutura do projeto:
   - listar diretórios raiz
   - identificar pastas de docs (`docs/`, `evidencias/`, `notes/`, etc.)
   - identificar stack (se houver `package.json`, `requirements.txt`, etc.)
2. Localizar “fontes de verdade” existentes:
   - `README.md`, `overview.md`, `STATUS.md`, `plan*.md`, `CONTRIBUTING.md`
   - regras/skills/workflows existentes em `.windsurf/`
3. Fazer leitura rápida (1–3 arquivos) para inferir:
   - objetivo do projeto
   - entregáveis
   - tipos de evidência (dados, PDFs, banco, entrevistas)
   - stakeholders (board, jurídico, operação)

## Saída do assistente

- Um resumo de 10–20 linhas: “o que este repo parece ser” + “o que já existe” + “lacunas para o bootstrap”.

---

# Etapa 1 — Escolha do modo de orquestração

## Pergunta (com opções)

Escolha o formato do prompt-mãe:

- [1] **Arquivo local**: `/.agent/ORCHESTRATOR.md` (referenciado manualmente no início da conversa)
- [2] **Regra always-on do Windsurf**: `/.windsurf/rules/systemprompt.md`
- [3] **Híbrido**: regra always-on curta + `ORCHESTRATOR.md` detalhado

## Ação do assistente

- Propor a melhor opção com base no que achou no repo (e.g., se já existe `.windsurf/rules`).

---

# Etapa 2 — Fontes de verdade (anti-reinício)

## Pergunta (com opções)

Quais arquivos serão as fontes de verdade para reiniciar conversas?

- [1] `overview.md` + `plan.md` + `STATUS.md`
- [2] `README.md` + `STATUS.md` (projeto simples)
- [3] Outro (assistente propõe baseado no repo)

## Ação do assistente

- Listar 3–8 candidatos encontrados no repo (ex.: `README.md`, `docs/`, `overview.md`, `plan*.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `ARCHITECTURE.md`).
- Propor 2–4 combinações numeradas (com base no que existe) e pedir escolha.
- Criar/atualizar os arquivos escolhidos (ou seus equivalentes) e registrar no `ORCHESTRATOR` como “fontes de verdade”.

## Definição mínima de `STATUS.md`

- fase atual
- top prioridades (3–7)
- pendências de evidência/leitura
- decisões e convenções
- próximos passos imediatos

---

# Etapa 3 — Motor de menus (design emergente)

## Regra do workflow

Em todas as decisões importantes, o assistente deve:

1. Fazer um **snapshot** do repo (10–20 linhas) com referências a paths.
2. Formular 2–4 **hipóteses** curtas sobre “o que este projeto é” e qual é a unidade central de trabalho.
3. Gerar 3–6 **opções numeradas** derivadas do snapshot.
4. Pedir ao usuário para escolher `[1] [2] [3] ...`.
5. Repetir o ciclo até o pacote mínimo estar claro.

## Menus mínimos que o assistente deve saber gerar

- **Menu A — Objeto nativo:** qual é a unidade central de trabalho (derivada do repo)?
- **Menu B — Eixo secundário:** qual eixo organiza a navegação (por componente, por entregável, por sprint, por risco, por hipótese, por cliente etc.)?
- **Menu C — Políticas transversais:** quais regras de qualidade/segurança devem ser explícitas (ex.: rastreabilidade, validação, confidencialidade, limites de escopo, DoD)?

---

# Etapa 4 — Contratos (DoD) dos artefatos

## Contrato mínimo — ORCHESTRATOR

- missão/escopo (1 parágrafo)
- como iniciar conversa (fontes de verdade)
- princípios operacionais (3–7 itens)
- artefatos do projeto (onde escrever o quê)
- índices: workflows + skills
- políticas transversais (não inventar; como validar; como citar/linkar evidência quando aplicável)
- modo de trabalho (árvore de decisão mínima)

## Contrato mínimo — STATUS

- estado atual (1–2 linhas)
- top prioridades (3–7)
- decisões e convenções
- pendências/lacunas (backlog curto)
- próximos passos imediatos

## Contrato mínimo — WORKFLOW

- Entrada
- Saída
- Passos
- Critérios de qualidade (DoD)
- Gates (quando pedir confirmação)

## Contrato mínimo — SKILL

- Quando usar
- Entrada
- Saída
- Passos
- Regras de qualidade/segurança

---

# Etapa 5 — Gerar o pacote inicial (derivado do repo)

## Pergunta (com opções)

Com base no snapshot + objeto nativo escolhido, qual deve ser o tamanho do pacote inicial?

- [1] **Enxuto**: 1 ORCHESTRATOR curto + 1 STATUS + 2 workflows + 2 skills
- [2] **Padrão**: enxuto + mais 1–2 workflows e 1–2 skills
- [3] **Expandido**: padrão + workflows/skills adicionais sugeridos pelo assistente

## Ação do assistente

- Propor os **loops de trabalho** detectados no repo (2–5), e sugerir quais viram workflows.
- Propor as **fricções** prováveis (2–5), e sugerir quais viram skills.
- Para cada workflow/skill sugerido, apresentar:
  - id proposto
  - 1 linha de objetivo
  - entradas/saídas esperadas

---

# Etapa 6 — Geração do ORCHESTRATOR

## Ação do assistente

Gerar o `ORCHESTRATOR` (arquivo ou regra always-on) usando o contrato mínimo e referenciando paths reais do repo.

## Pergunta (com opções)

Qual “tom” do assistente?

- [1] Auditor cético (tenta refutar)
- [2] Consultor pragmático (decide com incerteza explícita)
- [3] Promotor (argumenta a favor, mas sem inventar)

---

# Etapa 7 — Exemplos curtos (para orientar o usuário)

## Exemplo 1 (genérico)

Snapshot (assistente):

- Encontrei `package.json`, `src/`, `tests/` e `README.md`.
- O repo parece ser um projeto de software com fluxo de entrega contínua.

Hipóteses (assistente):

- H1: A unidade central de trabalho são `issues` (triagem → execução → validação).
- H2: A unidade central de trabalho são `pull requests` (review → merge → release).

Menu A — Objeto nativo (assistente):

- [1] Trabalhar por `issues` (triagem e execução como loops principais)
- [2] Trabalhar por `pull requests` (review e release como loops principais)
- [3] Trabalhar por `releases` (build/test/deploy/monitorar como loop principal)

Se o usuário escolher `[1]`, o próximo menu (assistente) deve propor 2–5 loops derivados:

- Loop 1: triagem de issue → estimativa → priorização
- Loop 2: implementar → testar → revisar → fechar

E então oferecer:

- [1] Pacote enxuto com workflows para Loop 1 e Loop 2
- [2] Pacote padrão adicionando um workflow de revisão/qualidade
- [3] Pacote expandido adicionando um workflow de release/observabilidade

## Exemplo 2 (genérico)

Snapshot (assistente):

- Encontrei `data/`, `notebooks/`, `paper/` e `references.bib`.
- O repo parece ser um projeto de pesquisa/análise com escrita de artigo.

Hipóteses (assistente):

- H1: A unidade central de trabalho são `experimentos` (definir → rodar → analisar → registrar).
- H2: A unidade central de trabalho são `claims` do paper (evidenciar → revisar → consolidar).

Menu A — Objeto nativo (assistente):

- [1] `experimentos`
- [2] `claims` do paper
- [3] `notebooks` (execução reprodutível)

Se o usuário escolher `[2]`, o assistente deve gerar opções para o eixo secundário com base no repo:

- [1] Organizar por seção do paper (`paper/`)
- [2] Organizar por dataset (`data/`)
- [3] Organizar por notebook (`notebooks/`)

E então propor um pacote inicial coerente (workflows/skills) sem depender de categorias pré-definidas no workflow.

---

# Etapa 8 — Gate final: validação rápida

## Ações do assistente

1. Rodar uma checagem rápida:
   - arquivos existem
   - índices apontam para paths válidos
   - cada workflow/skill tem frontmatter
2. Apresentar um resumo final:
   - o que foi criado
   - como iniciar conversas
   - o “primeiro passo recomendado” (ex.: indexar 1 evidência piloto)

## Saída

- Checklist final (DoD) + próximos passos.

---

# Notas de implementação (para o assistente)

- Sempre que possível, substituir perguntas abertas por propostas numeradas.
- O assistente deve usar ferramentas de busca/leitura do repo para reduzir perguntas.
- Antes de criar muitos arquivos, confirmar com o usuário.
