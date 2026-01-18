/**
 * Kanban Manager
 * Handles the interactive Kanban board for intervention management
 */

import { ARTICLES } from './config.js';

class KanbanManager {
    constructor() {
        this.boardEl = document.getElementById('kanban-board');
        this.sidebarEl = document.querySelector('.sin-sidebar');
        this.overlayEl = document.getElementById('sidebar-overlay');

        // Fixed columns definition
        this.columns = [
            { id: 'backlog', title: 'Backlog', class: 'status-backlog', icon: '📥' },
            { id: 'todo', title: 'A Fazer', class: 'status-todo', icon: '📋' },
            { id: 'doing', title: 'Em Andamento', class: 'status-doing', icon: '🚧' },
            { id: 'blocked', title: 'Bloqueado', class: 'status-blocked', icon: '⛔' },
            { id: 'done', title: 'Concluído', class: 'status-done', icon: '✅' }
        ];

        // State
        this.interventions = [];
        this.kanbanState = JSON.parse(localStorage.getItem('kanban_state') || '{}');

        this.init();
    }

    async init() {
        this.initializeSidebarState();
        this.setupGeneralEvents();
        this.renderSkeleton();
        await this.loadInterventions();
        this.renderBoard();
    }

    /**
     * Render the initial empty board structure with loading state
     */
    renderSkeleton() {
        this.boardEl.innerHTML = this.columns.map(col => `
            <div class="kanban-column ${col.class}" id="col-${col.id}">
                <div class="kanban-column-header">
                    <span class="column-title">${col.icon} ${col.title}</span>
                    <span class="column-count">...</span>
                </div>
                <div class="kanban-column-body" data-status="${col.id}">
                     <div class="loading">Carregando...</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Fetch all articles and extract interventions
     */
    async loadInterventions() {
        try {
            // Fetch all articles in parallel
            const promises = ARTICLES.map(async (article) => {
                try {
                    const response = await fetch(article.path);
                    if (!response.ok) return [];
                    const markdown = await response.text();
                    return this.extractFromMarkdown(markdown, article);
                } catch (error) {
                    console.error(`Error fetching ${article.path}:`, error);
                    return [];
                }
            });

            const results = await Promise.all(promises);

            // Flatten results
            const allInterventions = results.flat();

            // Deduplicate by ID (first occurrence wins)
            const uniqueMap = new Map();
            allInterventions.forEach(item => {
                if (!uniqueMap.has(item.id)) {
                    uniqueMap.set(item.id, item);
                }
            });

            this.interventions = Array.from(uniqueMap.values());

            // Sort by ID
            this.interventions.sort((a, b) => {
                // Extract number from I-XX
                const numA = parseInt(a.id.replace('I-', ''));
                const numB = parseInt(b.id.replace('I-', ''));
                return numA - numB;
            });

            console.log(`Loaded ${this.interventions.length} interventions.`);

        } catch (error) {
            console.error('Error loading interventions:', error);
            this.boardEl.innerHTML = `<div class="error">Erro ao carregar intervenções: ${error.message}</div>`;
        }
    }

    /**
     * Parse markdown and extract I-XX blocks
     */
    extractFromMarkdown(markdown, article) {
        if (typeof marked === 'undefined') {
            console.warn('Marked.js not loaded');
            return [];
        }

        // Use marked to get HTML structure
        const html = marked.parse(markdown);
        const div = document.createElement('div');
        div.innerHTML = html;

        const found = [];
        // Scan h2, h3, h4 to be robust across different file formats
        const headers = Array.from(div.querySelectorAll('h2, h3, h4'));

        headers.forEach(header => {
            // Regex matching I-XX pattern
            // Matches "I-01 - Title" or "I-01 — Title" or "I-01 – Title" (hyphen, em dash, en dash)
            const match = header.textContent.match(/^(I-\d+)\s*[—|–|-]\s*(.*)$/);

            if (match) {
                const id = match[1];
                const title = match[2].trim();

                // Extract content until next header
                let contentText = '';
                let next = header.nextElementSibling;
                while (next && !['H1', 'H2', 'H3', 'H4', 'HR'].includes(next.tagName)) {
                    contentText += next.textContent + ' ';
                    next = next.nextElementSibling;
                }

                // Try to find "Tensão" or "Descrição" for a summary
                // Pattern: **Label:** Content
                const tensionMatch = contentText.match(/Tensão:?\s*([^.]*)/i);
                let description = '';

                if (tensionMatch) {
                    description = tensionMatch[1].trim();
                } else {
                    // Fallback to first 100 chars
                    description = contentText.substring(0, 100).trim() + '...';
                }

                found.push({
                    id,
                    title,
                    description,
                    articleId: article.id,
                    articleTitle: article.title,
                    link: `index.html#${article.id}`
                });
            }
        });

        return found;
    }

    /**
     * Render the cards into columns
     */
    renderBoard() {
        // Clear existing items in columns (remove loading)
        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            if (colBody) colBody.innerHTML = '';
        });

        // Distribute cards
        this.interventions.forEach(card => {
            // Check saved state, default to backlog
            const status = this.kanbanState[card.id] || 'backlog';

            const colBody = document.querySelector(`#col-${status} .kanban-column-body`);
            if (colBody) {
                const cardEl = this.createCardElement(card);
                colBody.appendChild(cardEl);
            }
        });

        // Update counts
        this.updateCounts();
    }

    createCardElement(card) {
        const el = document.createElement('div');
        el.className = 'kanban-card';
        // el.draggable = true; // Not implementing DnD logic yet, just rendering
        el.dataset.id = card.id;

        el.innerHTML = `
            <div class="card-id">${card.id}</div>
            <div class="card-title">${card.title}</div>
            <div class="card-tags">
                <span class="card-tag" title="${card.articleTitle}">${card.articleTitle}</span>
            </div>
        `;

        // Click to navigate to source
        el.addEventListener('click', (e) => {
            // Don't navigate if we add drag logic later
            // window.location.href = card.link;

            // For now, let's just log or show alert, or navigate?
            // User Story says "Link de origem (para abrir o relatório original)".
            // Let's allow navigation on click
            window.location.href = card.link;
        });

        return el;
    }

    updateCounts() {
        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            const countEl = document.querySelector(`#col-${col.id} .column-count`);
            if (colBody && countEl) {
                countEl.textContent = colBody.children.length;
            }
        });
    }

    /**
     * Setup general UI event listeners (sidebar, mobile menu)
     * Reused logic from ReportReader to maintain consistency
     */
    setupGeneralEvents() {
        // Desktop Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile Menu Trigger
        const mobileToggle = document.getElementById('mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Overlay Click (close drawer)
        if (this.overlayEl) {
            this.overlayEl.addEventListener('click', () => this.toggleMobileMenu(false));
        }
    }

    /**
     * Initial sidebars state from localStorage
     */
    initializeSidebarState() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed) {
            this.sidebarEl.classList.add('collapsed');
        }
    }

    /**
     * Toggle desktop sidebar slim/full mode
     */
    toggleSidebar() {
        const isCollapsed = this.sidebarEl.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }

    /**
     * Toggle mobile drawer
     */
    toggleMobileMenu(forceState) {
        const isOpen = typeof forceState === 'boolean' ? forceState : !this.sidebarEl.classList.contains('mobile-open');

        if (isOpen) {
            this.sidebarEl.classList.add('mobile-open');
            this.overlayEl.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        } else {
            this.sidebarEl.classList.remove('mobile-open');
            this.overlayEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanManager = new KanbanManager();
});
