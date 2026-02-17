# Documentação Memora (Projeto Sodexo)

Este projeto utiliza uma base de dados **Memora** isolada para garantir a rastreabilidade e a organização das memórias qualitativas sem misturar com o `2ndbrain` global do usuário.

## Estrutura e Configuração

- **Arquivo de Banco de Dados:** `.memora/memories.db` (SQLite)
- **Configuração MCP:** `mcp_config.json` na raiz do projeto.
- **Porta do Grafo:** `8766` (http://localhost:8766/graph)

## Comportamento da IDE

O Antigravity/Windsurf detecta o arquivo `mcp_config.json` local e prioriza a instância local do Memora. Isso significa que ferramentas como `mcp_memora_memory_create` e `mcp_memora_memory_list` operarão exclusivamente sobre o arquivo `.memora/memories.db` deste diretório.

## Modo de Acesso de Emergência (Research Bridge)

Caso o MCP da IDE apresente erros de conexão (`EOF`), utilize o script de ponte local para interagir diretamente com o banco:

- **Busca:** `python3 .memora/research_bridge.py search "termo"`
- **Status:** `python3 .memora/research_bridge.py stats`

## Skills e Automação

As skills customizadas como `investigacao-tematica` e `sodexo-memory-index` foram adaptadas para priorizar o uso deste banco isolado, garantindo que o cérebro do projeto permaneça coeso.

---
*Atualizado em 12 de Fevereiro de 2026 por Clawdinho (👹).*
