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
        this.kanbanState = {}; // Will be loaded from Blob

        // API Endpoint
        this.API_URL = '/api/kanban-state';

        this.init();
    }

    async init() {
        this.initializeSidebarState();
        this.setupGeneralEvents();
        this.renderSkeleton();

        // Load data in parallel
        await Promise.all([
            this.loadInterventions(),
            this.loadRemoteState()
        ]);

        this.renderBoard();
        this.setupDragAndDrop();
    }

    /**
     * Load state from Netlify Blob
     */
    async loadRemoteState() {
        try {
            const response = await fetch(this.API_URL);
            if (response.ok) {
                this.kanbanState = await response.json();
                console.log('Remote state loaded:', this.kanbanState);
            }
        } catch (error) {
            console.error('Error loading remote state:', error);
            // Fallback to local storage if available or empty
            this.kanbanState = JSON.parse(localStorage.getItem('kanban_state') || '{}');
        }
    }

    /**
     * Save state to Netlify Blob
     */
    async saveState() {
        // Optimistic update locally
        localStorage.setItem('kanban_state', JSON.stringify(this.kanbanState));

        try {
            this.showSaving(true);
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.kanbanState)
            });

            if (!response.ok) {
                throw new Error('Failed to save to cloud');
            }
            this.showSaving(false);
        } catch (error) {
            console.error('Error saving state:', error);
            this.showError('Erro ao salvar na nuvem. Verifique sua conexão.');
            setTimeout(() => this.showSaving(false), 3000);
        }
    }

    showSaving(isSaving) {
        // Ensure we have a status indicator
        let statusEl = document.getElementById('kanban-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'kanban-status';
            statusEl.style.position = 'fixed';
            statusEl.style.bottom = '20px';
            statusEl.style.right = '20px';
            statusEl.style.padding = '8px 12px';
            statusEl.style.background = 'var(--color-bg-card)';
            statusEl.style.boxShadow = 'var(--shadow-md)';
            statusEl.style.borderRadius = 'var(--radius-md)';
            statusEl.style.fontSize = 'var(--font-size-sm)';
            statusEl.style.zIndex = '1000';
            statusEl.style.display = 'none';
            document.body.appendChild(statusEl);
        }

        if (isSaving) {
            statusEl.textContent = '☁️ Salvando...';
            statusEl.style.display = 'block';
            statusEl.style.color = 'var(--color-text-secondary)';
        } else {
            statusEl.textContent = '✅ Salvo';
            statusEl.style.color = 'var(--color-success)';
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 2000);
        }
    }

    showError(msg) {
        let statusEl = document.getElementById('kanban-status');
        if (statusEl) {
            statusEl.textContent = `❌ ${msg}`;
            statusEl.style.display = 'block';
            statusEl.style.color = 'var(--color-error)';
        } else {
            alert(msg);
        }
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
            // Support both string (legacy) and object formats
            const state = this.kanbanState[card.id];
            let status = 'backlog';

            if (state) {
                if (typeof state === 'string') {
                    status = state;
                } else if (state.status) {
                    status = state.status;
                }
            }

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
        el.draggable = true;
        el.dataset.id = card.id;

        el.innerHTML = `
            <div class="card-id">${card.id}</div>
            <div class="card-title">${card.title}</div>
            <div class="card-tags">
                <span class="card-tag" title="${card.articleTitle}">${card.articleTitle}</span>
            </div>
        `;

        // Drag events
        el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            e.dataTransfer.effectAllowed = 'move';
            el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            // Remove drop targets highlights
            document.querySelectorAll('.kanban-column-body').forEach(col => {
                col.classList.remove('drag-over');
            });
        });

        // Click to navigate to source
        el.addEventListener('click', (e) => {
            // Prevent navigation if we are dragging (though click usually doesn't fire on drag)
             window.location.href = card.link;
        });

        return el;
    }

    setupDragAndDrop() {
        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            if (!colBody) return;

            colBody.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                e.dataTransfer.dropEffect = 'move';
                colBody.classList.add('drag-over');
            });

            colBody.addEventListener('dragleave', () => {
                colBody.classList.remove('drag-over');
            });

            colBody.addEventListener('drop', (e) => {
                e.preventDefault();
                colBody.classList.remove('drag-over');

                const cardId = e.dataTransfer.getData('text/plain');
                const newStatus = colBody.dataset.status;

                this.handleCardMove(cardId, newStatus);
            });
        });
    }

    handleCardMove(cardId, newStatus) {
        // Update state - preserve other properties if any
        const currentState = this.kanbanState[cardId];

        if (typeof currentState === 'object' && currentState !== null) {
            this.kanbanState[cardId].status = newStatus;
            this.kanbanState[cardId].updatedAt = new Date().toISOString();
        } else {
            // Initialize new state object
            this.kanbanState[cardId] = {
                status: newStatus,
                updatedAt: new Date().toISOString()
            };
        }

        // Move element in DOM for immediate feedback
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        const targetColBody = document.querySelector(`#col-${newStatus} .kanban-column-body`);

        if (cardEl && targetColBody) {
            targetColBody.appendChild(cardEl);
            this.updateCounts();

            // Trigger save
            this.saveState();
        }
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
