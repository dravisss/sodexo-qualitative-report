# Plano de Implementação: Correção Estrutural e Coerência de Callouts

## Objetivo
Resolver inconsistências visuais e estruturais no relatório, garantindo que nenhum título seja "engolido" por accordions e que os callouts tenham uma estética premium unificada.

## Diagnóstico
1.  **Callouts Híbridos:** Existe uma mistura de callouts HTML (`<div class="callout">`), Markdown padrão (`> **Nota:**`) e estilo GitHub (`> [!NOTE]`).
2.  **Títulos "Engolidos":** A lógica de `renderInterventions` e `renderWarRoom` no `app.js` extrai `H4` e seu conteúdo para transformá-los em cards. Qualquer título (`H2`, `H3`) dentro das descrições das intervenções pode ser removido do fluxo principal de navegação.
3.  **Excesso de Separadores:** Uso redundante de `---` em intros curtas e ao redor de imagens, criando poluição visual.

## Mudanças Propostas

### 1. Unificação de Callouts [Premium]
Substituir todos os callouts manuais (`> **Nota:**`) pelo padrão suportado pelo `app.js` (`> [!TYPE]`).
*   Tipos disponíveis: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`.
*   Mapeamento:
    *   `> **Nota:**` -> `> [!NOTE]`
    *   `> **Atenção:**` -> `> [!WARNING]`
    *   `> **Insight:**` -> `> [!TIP]`

### 2. Saneamento de Separadores (`---`)
*   Remover separadores redundantes em `01`, `03`, `05` e `08`.
*   Manter apenas para quebras de grandes seções temáticas.

### 3. Proteção de Títulos (JS & Markdown)
*   **Markdown:** Garantir que descrições de intervenções (dentro de `08`) não contenham headers reais (`#`). Usar negrito ou listas.
*   **JS (`app.js`):** Ajustar o seletor de "fim de captura" de conteúdo das intervenções para não parar em qualquer header se ele estiver "dentro" do contexto da intervenção.

## Plano de Verificação

### Automated Tests
*   `grep -r "> \*\*" publish-site/Refined`: Verificar se ainda existem callouts do estilo antigo.
*   `grep -r "---" publish-site/Refined`: Verificar contagem de separadores por arquivo.

### Manual Verification
1.  Abrir o artigo `08` no browser.
2.  Verificar se o TOC (Table of Contents) da sidebar lista corretamente as frentes.
3.  Verificar se a Matrix de Priorização e o War Room estão renderizando todos os campos (Tensão, Descrição, etc.) sem quebrar o layout.
4.  Validar se os novos callouts (`[!NOTE]`) estão com o estilo premium (cor, ícone).
