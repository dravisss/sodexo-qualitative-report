# STATUS — Memória Operacional

## Objetivo

Este arquivo é uma **fonte de verdade operacional** para reduzir reinícios entre conversas.
Ele registra o estado real do projeto após a **Sincronização Meticulosa (Deep Scan)** realizada em Fev/2026.

## Como usar no início de uma conversa

1. Leia `overview.md` para recuperar tese/vocabulário.
2. Leia `Refined/08-plano-de-intervencao-estrategica.md` (Source of Truth).
3. Leia este arquivo para recuperar fase atual, prioridades e pendências.

## Estado Atual do Projeto

- **Fase Atual:** FASE 5 (Consolidação da Matriz e Argumentação)
- **Status Geral:** Dossiês 100% Sincronizados com o Plano.
- **Próximo Grande Entregável:** Matriz Consolidada de Intervenções (para Board).

### Conquistas Recentes (Deep Scan)
- **Sincronização Total:** Os 42 dossiês (`intervencoes/I-01` a `I-42`) foram auditados e têm conteúdo idêntico ao Plano #08.
- **Limpeza:** Rascunhos obsoletos (`novas_intervencoes`, `mapeamento_tensoes`) foram removidos para evitar alucinação de IDs antigos.
- **Correção Estrutural:** Intervenções que tinham IDs errados no header (ex: I-35) foram corrigidas.

---

## Mapa de Intervenções (Status: CONCLUÍDO E AUDITADO)

Todas as intervenções abaixo possuem dossiê padronizado em `intervencoes/`.

### FRENTE 1: TORNIQUETE (I-01 a I-07)
*Foco: Dignidade Básica e Estancamento de Sangria*
- [x] I-01: Compra centralizada de uniformes e EPI
- [x] I-02: Desvincular cesta básica de atestados médicos
- [x] I-03: Fundo de Correção Estrutural (Mesa Compartilhada)
- [x] I-04: Gatilho de Execução Subsidiária de Manutenção
- [x] I-05: Provisionamento de Ergonomia e Segurança (CAPEX HSE)
- [x] I-06: Licença para Cuidar de Familiares (Care Leave)
- [x] I-07: Conexão Automática HSE → Manutenção

### FRENTE 2: DESCOMPRESSÃO (I-08 a I-19)
*Foco: Clima, Saúde Mental e Rituais Operacionais*
- [x] I-08: Rodízio de tarefas pesadas
- [x] I-09: Auditoria e Monitoramento de Saúde de Veteranos
- [x] I-10: Auditoria técnica de fluxo e recursos
- [x] I-11: Calendário fixo de celebrações da equipe (com Provisionamento)
- [x] I-12: Banco de Horas Regulamentado / Prioridade Pagamento
- [x] I-13: DDS Estratégico (Saúde Mental & Escuta)
- [x] I-14: Abertura dos números e limites para o time
- [x] I-15: Sistematização de Rituais de Passagem de Turno
- [x] I-16: Turno de Pré-Preparo (Mise en Place)
- [x] I-17: Provisionamento de Benefícios (Anti-furto/Apoio)
- [x] I-18: Monitoramento de Saúde da Operação (DDS Expandido)
- [x] I-19: Guia de Gestão Geral (Financeiro & Operacional)

### FRENTE 3: REESTRUTURAÇÃO (I-20 a I-37)
*Foco: Regras do Jogo, Incentivos e Processos*
- [x] I-20: Provisionamento Orçamentário de Rescisão
- [x] I-21: Programa de Negociação Ganha-Ganha
- [x] I-22: Revisão do quadro pela demanda real
- [x] I-23: Provisionamento para Reparos Essenciais
- [x] I-24: Gestão Compartilhada (Lead Cook + GU)
- [x] I-25: Fim do cargo ASG/OSG faz-tudo
- [x] I-26: Revisão dos Deflatores de Rotatividade na PLR
- [x] I-27: Gatilho progressivo da PLR
- [x] I-28: Desconto proporcional para faltas
- [x] I-29: SLA de Atendimento para Solicitações de RH
- [x] I-30: Auditoria de Folha Trimestral
- [x] I-31: Processo Seletivo com Período de Experiência Real
- [x] I-32: Auditoria de PFP (Vício de Origem em Vendas)
- [x] I-33: Limpeza da Base de GUs (Saneamento de Função)
- [x] I-34: Apoio Centralizado de Recrutamento
- [x] I-35: Protocolo de Saneamento Estrutural
- [x] I-36: Pequeno Caixa Express
- [x] I-37: Guardião da Segurança

### FRENTE 4: REPOSICIONAMENTO (I-38 a I-42)
*Foco: Atratividade de Mercado e Longo Prazo*
- [x] I-38: Fretado e escalas competitivas
- [x] I-39: Novo pacote de benefícios atrativo (saúde + VR)
- [x] I-40: Plano de carreira por tempo de serviço
- [x] I-41: Ajuste salarial ao mercado local
- [x] I-42: Reduzir dependência de terceirizados

---

## Evidências e Ativos (Auditados)

- **MoC (Map of Content):** `evidencias/indice/moc.md`
- **Painel de Risco:** `Refined/07-painel-risco-consolidado.md`
- **Plano Estratégico:** `Refined/08-plano-de-intervencao-estrategica.md`

## Próximos Passos (Imediatos)

1.  **Geração da Matriz Consolidada:**
    - Cruzar os 42 dossiês em uma tabela única (Impacto x Viabilidade x Risco).
    - Artefato alvo: `Refined/matriz-intervencoes-consolidada.md`.

2.  **Validação de Argumentários:**
    - Verificar quais intervenções críticas precisam de `argumentario.md` (One-Pager de Defesa).
    - Status: I-03, I-19, I-21 já possuem drafts avançados. Expandir para Top 10.

3.  **Relatório Final:**
    - Consolidar a narrativa conectando Tese (Overview) -> Plano (#08) -> Matriz -> Dossiês.

## Convenções de Trabalho

- **Source of Truth:** Se houver divergência entre um Dossiê e o Plano #08, **o Plano #08 vence**.
- **Edição:** Nunca edite intervenções manualmente sem rodar o script de sincronização ou verificar a consistência com o Plano.
- **Deleção:** Arquivos obsoletos devem ser deletados, não arquivados, para evitar poluição da busca semântica.
