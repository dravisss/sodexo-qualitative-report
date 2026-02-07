
### **1. Diagnóstico Multicausal (O Resgate)**

Atualmente, HSE (Segurança) e Manutenção operam em silos incomunicáveis. O técnico de segurança aponta o risco ("fio desencapado"), mas o chamado morre na fila da manutenção porque não tem "etiqueta de prioridade". É uma **Falha de Integração de Processos**: a auditoria de segurança é vista como "consultiva", não "mandatória". A solução é dar **Poder de Polícia** ao relatório de HSE: se HSE apontou risco à vida, o chamado de manutenção é aberto automaticamente com SLA de emergência (Crítico).

### **2. Proposta de Integração em 3 Camadas**

#### **Camada 1 (Estratégica) -> Para `08-plano-de-intervencao-estrategica.md`**

```markdown
#### I-09 — Gatilho Mandatório de Segurança (Ponte HSE-Manutenção)
**Tensão:** Relatórios de segurança (HSE) apontam riscos graves que são ignorados pela manutenção por falta de priorização ou orçamento, gerando acidentes anunciados.
**Descrição:** Integrar sistemas para que qualquer "Não-Conformidade Crítica" em auditoria de HSE gere automaticamente uma Ordem de Serviço (OS) de Manutenção com SLA de emergência (Prioridade 0), bloqueando o fechamento do chamado até validação da segurança.
**Objetivo:** Garantir que riscos à vida tenham 'Fast Track' na fila de manutenção.
```

#### **Camada 2 (Evidências) -> Para `intervencoes/I-09-auditoria-tecnica-de-fluxo-e-recursos.md`**

*Adicionar na seção "O que está provado vs. o que é hipótese":*

*   **Acidentes Anunciados**: Histórico de incidentes que já constavam em relatórios de auditoria anteriores não resolvidos.
*   **Desconexão de SLA**: Manutenção mede sucesso por "tempo de resposta", HSE mede por "risco mitigado". As métricas não conversam.

#### **Camada 3 (Narrativa) -> Para `intervencoes/I-09-auditoria-tecnica-de-fluxo-e-recursos.argumentario.md`**

*   **ATUALIZAÇÃO CRÍTICA DA TESE**: De: "Melhorar auditoria". Para: "Transformar a auditoria em mecanismo de execução. O relatório de HSE deixa de ser um 'papel de conselho' e vira uma 'ordem de serviço'."

*Adicionar na seção "Objeções prováveis":*

*   **"A manutenção já está atolada, isso vai furar a fila."**

*Adicionar na seção "Respostas":*

*   **Defesa da Vida**: "Sim, vai furar a fila. E deve. Risco de acidente (e processo criminal) tem prioridade sobre consertar ar condicionado do escritório. É gestão de risco puro."

### **3. Menu de Decisão**

*   `[1]` **Integrar Tudo**
*   `[2]` **Ajustar Redação**
*   `[3]` **Cartão Vermelho**
