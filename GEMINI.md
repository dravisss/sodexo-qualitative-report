# GEMINI.md - Análise Qualitativa Sodexo (Report Reader)

Este projeto é uma **Single Page Application (SPA)** de alta fidelidade para leitura de relatórios qualitativos, focada na análise de tensões sistêmicas, turnover e planos de intervenção estratégica para a Sodexo.

## 🚀 Visão Geral do Projeto

-   **Propósito:** Transformar uma investigação qualitativa de campo (≈46 mil pessoas; ≈40% turnover anual) em uma experiência interativa e acionável.
-   **Tese Central:** O turnover não é um "problema de RH", mas um **fenômeno sistêmico** produzido pela maximização de margem (GM) de curto prazo que gera **passivos ocultos** (riscos trabalhistas, colapsos operacionais e adoecimento).
-   **Público-alvo:** Board Executivo, Gestores Regionais e Analistas de RH.

## 🧠 Núcleo Teórico e Argumentativo

Para entender o conteúdo renderizado, considere os seguintes pilares extraídos do `overview.md`:

1.  **Arquitetura de Incentivos (Página #01):** Regras internas (PLR binária, rescisão debitada na unidade, GM como KPI central) tornam racional o subdimensionamento e o improviso.
2.  **Travamento Rescisório (Página #03):** Impasse onde a empresa evita demitir (custo local) e o trabalhador evita pedir demissão (perda de direitos), gerando um "equilíbrio ruim" de desengajamento.
3.  **Os 4 Ciclos Sistêmicos (Página #11):**
    -   **Retenção Forçada:** Bloqueio de demissões → Baixa produtividade.
    -   **Presenteísmo Danoso:** Punição ao atestado → Agravamento de lesões.
    -   **Sucateamento:** Corte de manutenção → Esforço manual → Adoecimento.
    -   **Seleção Adversa:** Condições precárias → Perda de atratividade da vaga.

## 🛠️ Stack Tecnológica

### Frontend (Arquitetura "No-Build")
-   **Linguagem:** Vanilla JavaScript (ES Modules).
-   **Estilização:** CSS3 puro com **Design System SIN** (`css/tokens.css`).
-   **Renderização:** Markdown parsing dinâmico via `marked.js` com transformações semânticas em `js/app.js`.
-   **Navegação:** Hash-based (`#id`). O documento "autoridade" de navegação é a **Página #00** (Mapa de Conteúdo).

### Backend & Infraestrutura
-   **Plataforma:** Netlify (Hosting + Functions).
-   **Banco de Dados:** PostgreSQL (estruturado) + Netlify Blobs (arquivos/evidências).
-   **Memória Qualitativa:** SQLite (Memora) em `.memora/memories.db` para rastreabilidade de campo.

## 🏗️ Arquitetura de Conteúdo e Intervenções

O plano de intervenção (`Página #08`) é estruturado em **4 Frentes** que guiam a lógica de desenvolvimento de componentes:
1.  **Torniquete:** Imediato/Dignidade (EPIs, Cesta Básica).
2.  **Descompressão:** Curto prazo/Clima (Rodízios, Escuta).
3.  **Reestruturação:** Médio prazo/Regras (Provisionamento de rescisão, Revisão de PLR).
4.  **Reposicionamento:** Longo prazo/Mercado (Fretados, Ajuste Salarial).

## 📂 Organização de Diretórios e Fluxo de Evidências

O projeto utiliza um sistema de **Ancoragem de Evidências** para garantir que cada intervenção seja auditável e baseada em dados reais.

### 1. `evidencias/`: O Camada de Prova
-   `banco/`: Exports estruturados do PostgreSQL (JSON).
-   `blobs/`: Arquivos brutos (XLSX, PDF) e seus derivados processados (CSV, extrações de texto via Gemini).
-   `indice/`: Mapas de rastreabilidade (MoC), inventários e relatórios de auditoria de cobertura.
-   `notas/`: Sínteses analíticas que transformam dados brutos em "Claims" (ex: custo real de uma rescisão, desvios de budget de EPI).
-   `pdfs/`: Documentos externos (contratos, propostas, políticas de PLR).

### 2. `intervencoes/`: A Camada de Ação
Contém o detalhamento técnico de cada estratégia (`I-01` a `I-42`):
-   **Arquivos `I-XX.md`:** Especificação técnica contendo Tensão, Objetivo, Impacto, Métricas e o **Apêndice de Rastreabilidade** (links diretos para as evidências).
-   **Arquivos `I-XX.argumentario.md`:** Business Case focado em convencer o Board e tratar objeções prováveis.

**Padrão de Auditoria S1:** Cada intervenção deve atingir a régua **S1** (mínimo de 2 âncoras "Provado" ou 1 "Provado" + 2 "Sustentado") antes de ser considerada pronta para implementação.

## 📜 Convenções de Engenharia

1.  **Regras sobre Pessoas:** O relatório foca em auditar regras, não gestores. O código deve refletir essa estruturação sistêmica.
2.  **Design System SIN:** Uso obrigatório de variáveis CSS para consistência estética.
3.  **Padrões Markdown:** A renderização de "Cards de Intervenção" e "Timeline" depende de padrões fixos nos arquivos `.md`.
4.  **Dual Storage:** PostgreSQL para dados; Blobs para arquivos. LocalStorage como cache offline-first.

---
*Atualizado com base na Auditoria de Cobertura e Plano de Intervenção (Fevereiro/2026).*

