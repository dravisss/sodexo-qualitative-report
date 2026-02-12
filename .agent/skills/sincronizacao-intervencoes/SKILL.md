---
name: sincronizacao-intervencoes
description: Mantém a consistência entre Plano Estratégico, Dossiês, Matrizes e Argumentários após alterações em intervenções (I-XX) (Adicionar, remover ou editar intervenções).
---

# Skill — Sincronização de Intervenções (SoT Flexível)

## Quando usar

- Sempre que você ou o usuário editarem o Plano Estratégico (`Refined/08-plano-de-intervencao-estrategica.md`), um Dossiê (`intervencoes/I-XX-*.md`) ou um Argumentário (`intervencoes/I-XX-*.argumentario.md`).
- Quando o usuário mandar um comando como "sincronize as mudanças" ou "atualize os registros da I-XX".

## Procedimento de Sincronização

1.  **Diagnóstico**:
    - Rode `python3 .agent/skills/sincronizacao-intervencoes/scripts/sync_manager.py find I-XX` para listar todos os arquivos impactados.
    - Rode `python3 .agent/skills/sincronizacao-intervencoes/scripts/sync_manager.py extract I-XX` para ler o estado atual de cada arquivo.
2.  **Identificação da Fonte de Verdade (SoT)**:
    - Se a mudança foi no **Plano #08**, use-o como SoT para: Tensão, Descrição, Objetivo e Impacto.
    - Se a mudança foi no **Dossiê**, use-o como SoT para: Detalhes técnicos, Evidências e Referências.
3.  **Execução Concatenada**:
    - **Plano #08**: Atualize se houver mudança de narrativa.
    - **Dossiê**: Sincronize os campos de identificação e resumo vindos do Plano, preservando as seções de Evidências/Lacunas.
    - **Argumentário**: Re-gere ou atualize a tese e os dados provados com base no Dossiê atualizado.

## Procedimento de Remoção (Automático)

1.  **Use o comando dedicado**:
    - Rode `python3 .agent/skills/sincronizacao-intervencoes/scripts/sync_manager.py remove I-XX` (ex: `I-05`).
    - O script irá automaticamente:
        - Arquivar os arquivos da `I-XX` em `_archive/`.
        - Renumerar todas as intervenções seguintes (I-06 -> I-05, etc.) nos arquivos e conteúdo.
        - Atualizar o Plano #08 removendo o bloco da `I-XX` e corrigindo os IDs seguintes.

2.  **Verificação**:
    - Rode `python3 .agent/skills/sincronizacao-intervencoes/scripts/sync_manager.py audit` para garantir integridade.

## Regras de Ouro

- **Mantenha o Formato**: Cada arquivo tem seu template próprio (tabelas vs listas vs callouts). Não mude o formato, apenas o conteúdo.
- **Rastreabilidade**: Nunca remova referências (`evidencias/path/ID`) ao sincronizar, a menos que a evidência tenha sido explicitamente invalidada no Dossiê.
- **Auditoria Final**: Sempre rode o `audit` após uma sincronização em massa.
