# Simulador de Investimento Estratégico (#16)

Este simulador permite projetar o orçamento necessário para a transição do **Cenário A (Status Quo)** para o **Cenário B (Intervenção Estratégica)**.

> [!TIP] **Como usar:**
> Ajuste as variáveis de mercado e selecione as intervenções para visualizar o impacto no P&L e o Payback estimado.

## ⚙️ Variáveis de Cenário

| Variável | Valor Base | Descrição |
| :--- | :--- | :--- |
| **Unidade Alvo** | Cajamar (Food) | Headcount: 24 |
| **Meta de Turnover** | 20% ao ano | Redução de 37.5 pontos percentuais |
| **Custo Cesta Básica** | R$ 248,25 | Valor atual apurado via SAP |
| **Piso de Mercado (Meli)** | R$ 2.100,00 | Estimativa de campo (Mercado Livre) |

---

## 🚀 Seleção de Intervenções

<div id="budget-simulator-root">
    <!-- O motor JS irá renderizar o simulador interativo aqui -->
</div>

### Matriz de Investimento Estimada (Cajamar)

| ID | Intervenção | Investimento Mensal (R$) | Tipo | Impacto ROI |
| :--- | :--- | :--- | :--- | :--- |
| I-01 | Uniformes/EPI (Centralizado) | R$ 300,00 | OPEX | Redução de passivo |
| I-20 | Provisionamento Rescisão | R$ 1.436,42 | Aloc. | Destrave de Gestão |
| I-31 | Job Shadow (Onboarding) | R$ 450,00 | OPEX | Queda Turnover < 45d |
| I-38 | Fretado (3 Rotas) | R$ 6.465,12 | OPEX | Expansão de Pool |
| I-41 | Ajuste Salarial (Bench Meli) | R$ 4.632,00 | OPEX | Atratividade e Retenção |

---

## 📈 Projeção de Resultados (Business Case)

### Economia Estimada com Turnover
Ao reduzir o turnover de 57.5% para 20% em Cajamar, evitamos aproximadamente **9 desligamentos por ano**.
- **Custo Médio de Rescisão (5 anos):** R$ 17.237,00
- **Economia Total Anual:** R$ 155.133,00
- **Economia Mensal:** **R$ 12.927,75**

> [!IMPORTANT] **Conclusão Preliminar:**
> A economia gerada apenas pela redução de rescisões em Cajamar (**R$ 12,9k/mês**) é suficiente para cobrir o custo do Ajuste Salarial, Uniformes e Job Shadow, sobrando margem para financiar o Fretado.

---

## 📚 Metodologia e Fontes de Dados

Para garantir a precisão orçamentária perante o Board, este simulador utiliza âncoras diretas dos documentos auditados:

### 1. Multiplicador de Pessoal (Fator de Encargos)
Qualquer ajuste salarial nominal é multiplicado por **1.6576** para refletir o custo real empresa (GP).
- **Componentes:** INSS (20%), FGTS (8%), Férias/13º proporcional (21.17%), Provisões e RAT (16.59%).
- **Fonte:** Procedimento `REB_OPE_15`, Seção 6.1.

### 2. Valoração do ROI (Turnover)
A economia é calculada sobre **Desligamentos Evitados/Ano**.
- **Custo Unitário da Rescisão:** R$ 17.237,00 (referência: veterano de 5 anos).
- **Fonte:** `Simulação Aviso Prévio Indenizado.csv`.
- **Nota:** Este é um cálculo conservador. Não inclui custos de treinamento (I-31) nem perda de produtividade operacional.

### 3. Benchmarking de Mercado (A VALIDAR)
Os valores de Piso de Mercado e Fretado são **estimativas baseadas em relatos de campo** (Mercado Livre/Polos Logísticos) e devem ser validados com pesquisa salarial formal antes da aprovação final.

### 4. Baseline Operacional (Unidades)
- **Cajamar (Food):** Headcount 24, Turnover 57.5% (Fonte: `table_0.md`).
- **Guarulhos (FM):** Headcount 57, Turnover 119.2% (Fonte: `table_0.md`).
- **Cesta Básica:** R$ 248,25 (Apurado via média de gastos SAP Real JAN/25).

---
*Dados baseados no fechamento FY25 e Simulações de RH (Fevereiro/2026).*
