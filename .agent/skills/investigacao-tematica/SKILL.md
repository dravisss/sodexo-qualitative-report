---
name: investigacao-tematica
description: CRITICAL / MANDATORY. Run this skill whenever the user asks a thematic, qualitative, or research-based question about Sodexo, turnover, or specific topics. Performs a deep, hybrid search to provide a direct answer based on evidence.
---

# Investigação Temática

Esta skill transforma uma pergunta ou tema em um diagnóstico completo, cruzando:
1. **Busca Semântica**: Explora o "Cérebro" do projeto (Claims, Narrativas, Intervenções).
2. **Busca Literal**: Varre o código/arquivos em busca de referências específicas.
3. **Síntese GenAI**: Conecta os pontos para responder à pergunta do usuário.

## Usage

```bash
# Quando o usuário faz uma pergunta qualitativa:
@antigravity run investigacao-tematica "Como a cesta básica afeta o turnover?"
```

## Instructions for the Agent (You)

When the user triggers this skill or asks a qualitative question:

1.  **Analyze & Expand**:
    *   Think: "What are the synonyms and related terms for this question in the Sodexo context?"
    *   Example: "benefícios" -> `(benefícios OR "cesta básica" OR "vale alimentação" OR "VA" OR "VR")`

2.  **Execute Search (Hybrid)**:
    *   **Step A (Semantic/Fallback)**:
        *   Tente `mcp_memora_memory_hybrid_search` primeiro.
        *   Se falhar (EOF), use: `python3 .memora/research_bridge.py search "{topic}"`
    *   **Step B (Literal)**: Call `grep_search` with relevant keywords in `intervencoes/` and `evidencias/`.

3.  **Synthesize to ANSWER**:
    *   Do NOT just list results. **Construct a direct answer.**
    *   Structure the response as:
        - **Resposta Direta**: [A síntese clara do que descobrimos]
        - **Evidências de Apoio**: [Citações de Claims ou MoC]
        - **Status na Narrativa**: [Como isso está sendo contado no relatório final]
        - **Implicação p/ Intervenções**: [Quais I-XX resolvem ou são citadas]

4.  **Refinement**: If no evidence is found, state the gap clearly and suggest a different investigative path.
