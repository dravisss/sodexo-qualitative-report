# PRD: Relatório Sodexo - Kanban de Intervenções

## Overview
Implementação de um quadro Kanban dedicado para o relatório da Sodexo, permitindo a visualização e gestão das intervenções extraídas dos relatórios em Markdown. O sistema funcionará como uma ferramenta de gestão de projetos leve, integrada à arquitetura existente (Netlify Functions/Blobs), permitindo colaboração básica através de sincronização via nuvem.

## Goals
- Visualizar todas as intervenções do relatório em um quadro interativo.
- Permitir gestão de estado (mover entre colunas) e enriquecimento de informações (responsável, atualizações).
- Manter sincronia de dados entre usuários utilizando Netlify Blobs.
- Preservar a integridade do conteúdo original (Markdown) enquanto permite gestão dinâmica.

## Quality Gates

**Como não há suíte de testes automatizados configurada, a validação será manual.**

Para cada história de usuário, os seguintes critérios devem ser verificados manualmente:
- **Linting (se disponível):** O código deve seguir o padrão do projeto (ES Modules, sem bundler).
- **Funcionalidade:** Verificar se o comportamento esperado ocorre no navegador.
- **Console:** Garantir que não há erros de JavaScript no console do navegador.
- **Responsividade:** O layout deve funcionar em desktop e mobile.

## User Stories

### US-001: Estrutura da Página Kanban
**Description:** Como usuário, quero acessar uma página dedicada ao Kanban através de um link na navegação principal, para que eu possa gerenciar as intervenções sem sair do contexto do aplicativo.

**Acceptance Criteria:**
- [ ] Criar `kanban.html` com a estrutura base (header, container do board).
- [ ] Criar `css/kanban.css` seguindo as variáveis de estilo do SIN Design System.
- [ ] Criar `js/kanban.js` como módulo ES6.
- [ ] Adicionar link "Gestão de Intervenções" no menu principal da aplicação existente.
- [ ] A página deve carregar corretamente e exibir o layout vazio das colunas fixas: Backlog, A Fazer, Em Andamento, Bloqueado, Concluído.

### US-002: Extração de Intervenções
**Description:** Como usuário, quero que o sistema identifique automaticamente as intervenções descritas nos arquivos Markdown do relatório, para que eu não precise cadastrá-las manualmente.

**Acceptance Criteria:**
- [ ] Implementar função para varrer os arquivos na pasta `Refined/` (utilizando a lista do `js/config.js`).
- [ ] Extrair seções identificadas como "Intervenção" ou padrões definidos nos Markdowns.
- [ ] Gerar uma lista de objetos JSON contendo: ID único (hash do título/conteúdo), Título, Descrição resumida e Link de origem (para abrir o relatório original).
- [ ] Exibir os cards extraídos na coluna "Backlog" (se ainda não tiverem estado salvo).

### US-003: Integração com Netlify Blobs (Persistência)
**Description:** Como usuário, quero que as alterações que faço no quadro sejam salvas na nuvem, para que meus colegas possam ver o status atualizado das tarefas.

**Acceptance Criteria:**
- [ ] Criar/Ajustar Netlify Function para leitura e escrita em um store dedicado do Netlify Blobs (ex: `sodexo-kanban-state`).
- [ ] Ao carregar a página, mesclar as intervenções extraídas (US-002) com o estado salvo no Blob (coluna atual, responsável, etc).
- [ ] Implementar salvamento automático ao mover cards ou editar dados.
- [ ] Tratamento de erro: Exibir alerta caso a conexão falhe.

### US-004: Quadro Interativo com SortableJS
**Description:** Como usuário, quero mover os cards entre as colunas arrastando e soltando, para atualizar o status das intervenções de forma intuitiva.

**Acceptance Criteria:**
- [ ] Importar biblioteca SortableJS (via CDN ou vendor).
- [ ] Tornar as colunas do Kanban áreas de drop ativas.
- [ ] Ao soltar um card, atualizar visualmente a posição.
- [ ] Disparar evento de salvamento (US-003) imediatamente após o movimento.
- [ ] Animações suaves de drag & drop.

### US-005: Edição de Detalhes do Card
**Description:** Como usuário, quero clicar em um card para adicionar informações de gestão (responsável, data, atualizações), para detalhar o andamento da intervenção.

**Acceptance Criteria:**
- [ ] Ao clicar no card, abrir um Modal ou Painel Lateral.
- [ ] Exibir dados estáticos (vindos do Markdown) como somente leitura.
- [ ] Exibir campos editáveis: Responsável (texto simples), Data Limite, Últimas Atualizações (campo de texto multilinhas).
- [ ] Botão "Salvar" que persiste os dados no Netlify Blob associado ao ID do card.
- [ ] Utilizar a identificação de usuário existente (localStorage/Session) para preencher logs de autoria se disponível.

### US-006: Sincronização em Tempo Real (Polling)
**Description:** Como usuário, quero ver atualizações feitas por outros usuários sem precisar recarregar a página manualmente o tempo todo.

**Acceptance Criteria:**
- [ ] Implementar mecanismo de *polling* que consulta o Netlify Blob a cada X segundos (ex: 30s).
- [ ] Atualizar a posição dos cards e dados se houver mudança no servidor.
- [ ] Evitar sobrescrever se o usuário estiver arrastando um card no momento da atualização.

## Functional Requirements
- **FR-1:** O sistema deve suportar as colunas fixas: Backlog, A Fazer, Em Andamento, Bloqueado, Concluído.
- **FR-2:** Os cards devem manter um vínculo (link) para o texto original no relatório.
- **FR-3:** A persistência deve usar chaves baseadas em hash do conteúdo para reencontrar cards mesmo que a ordem dos arquivos mude.
- **FR-4:** O layout deve ser responsivo (scroll horizontal em mobile se necessário).

## Non-Goals
- Autenticação complexa com senha (usará o mecanismo existente).
- Criação de novas intervenções que não existam no Markdown (apenas enriquecimento das existentes).
- Histórico detalhado de alterações (audit log complexo).
- Notificações por e-mail ou push.

## Technical Considerations
- **Stack:** Vanilla JS, HTML, CSS.
- **Lib Externa:** SortableJS.
- **Backend:** Netlify Functions (Node.js) + Blobs.
- **Identificadores:** É crítico gerar IDs estáveis para as intervenções baseados no conteúdo/título para que o vínculo com os dados do Blob não se perca se o Markdown for reprocessado.

## Success Metrics
- Carregamento do quadro em menos de 2 segundos.
- Sincronização correta de movimento de cards entre duas abas abertas.
- Capacidade de salvar e recuperar anotações em qualquer card.