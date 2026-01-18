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

        // Editor Elements
        this.editorEl = document.getElementById('card-editor');
        this.editorOverlayEl = document.getElementById('card-editor-overlay');
        this.editorForm = document.getElementById('card-edit-form');
        this.currentEditingCardId = null;

        // Fixed columns definition (V2: 4 columns)
        this.columns = [
            { id: 'backlog', title: 'Backlog', class: 'status-backlog', icon: '📥' },
            { id: 'doing', title: 'Em andamento', class: 'status-doing', icon: '🚧' },
            { id: 'blocked', title: 'Bloqueado', class: 'status-blocked', icon: '⛔' },
            { id: 'done', title: 'Concluído', class: 'status-done', icon: '✅' }
        ];

        // Legacy status mapping (V1 -> V2)
        // Only 'todo' needs migration to 'doing'
        this.legacyStatusMap = {
            'todo': 'doing'      // "A Fazer" -> "Em andamento"
        };

        // State
        this.interventions = [];
        this.kanbanState = {}; // Will be loaded from Blob
        this.isSaving = false;
        this.isDragging = false;

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
        this.startPolling();

        // Save any pending migrations from V1 -> V2
        if (this._hasPendingMigration) {
            this._hasPendingMigration = false;
            await this.saveState();
        }
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
        this.isSaving = true;
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
        } finally {
            this.isSaving = false;
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
     * Start polling for updates
     */
    startPolling() {
        // Poll every 30 seconds
        setInterval(() => this.checkForUpdates(), 30000);
    }

    /**
     * Check for remote updates
     */
    async checkForUpdates() {
        // Don't update if user is dragging or saving
        // We allow updates during editing (editor is overlay), but dragging needs stability
        if (this.isDragging || this.isSaving) {
            console.log('Skipping poll due to user interaction');
            return;
        }

        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) return;

            const remoteState = await response.json();

            // Compare states to avoid unnecessary re-renders
            if (JSON.stringify(remoteState) !== JSON.stringify(this.kanbanState)) {
                console.log('Remote changes detected, updating board...');
                this.kanbanState = remoteState;
                this.renderBoard();

                // Update local storage
                localStorage.setItem('kanban_state', JSON.stringify(this.kanbanState));
            }
        } catch (error) {
            console.error('Error polling for updates:', error);
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
            let originalStatus = null;

            if (state) {
                if (typeof state === 'string') {
                    status = state;
                } else if (state.status) {
                    status = state.status;
                }
            }

            // V2 Migration: Map legacy statuses to new column structure
            if (this.legacyStatusMap[status]) {
                originalStatus = status;  // Preserve original for substatus
                status = this.legacyStatusMap[status];

                // Update state to persist the migration with substatus
                this.migrateCardStatus(card.id, status, originalStatus);
            }

            const colBody = document.querySelector(`#col-${status} .kanban-column-body`);
            if (colBody) {
                const cardEl = this.createCardElement(card, originalStatus);
                colBody.appendChild(cardEl);
            }
        });

        // Update counts
        this.updateCounts();
    }

    createCardElement(card, originalStatus = null) {
        const el = document.createElement('div');
        el.className = 'kanban-card';
        el.dataset.id = card.id;

        // Get substatus from state if not passed directly
        const state = this.kanbanState[card.id];
        let substatusLabel = null;
        if (originalStatus) {
            const labels = { 'todo': 'A Fazer', 'doing': 'Em Andamento' };
            substatusLabel = labels[originalStatus];
        } else if (state && typeof state === 'object' && state.substatusLabel) {
            substatusLabel = state.substatusLabel;
        }

        const substatusHtml = substatusLabel
            ? `<span class="card-substatus">${substatusLabel}</span>`
            : '';

        el.innerHTML = `
            <div class="card-header">
                <div class="card-id">${card.id}</div>
                ${substatusHtml}
            </div>
            <div class="card-title">${card.title}</div>
            <div class="card-tags">
                <span class="card-tag" title="${card.articleTitle}">${card.articleTitle}</span>
            </div>
        `;

        // Click to open editor instead of direct navigation
        el.addEventListener('click', (e) => {
            // Prevent if dragging (Sortable creates a clone, but sometimes original receives click)
            if (el.classList.contains('sortable-drag')) return;

            this.openEditor(card.id);
        });

        return el;
    }

    setupDragAndDrop() {
        // Check if Sortable is loaded
        if (typeof Sortable === 'undefined') {
            console.error('SortableJS not loaded');
            return;
        }

        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            if (!colBody) return;

            new Sortable(colBody, {
                group: 'kanban', // Allow dragging between columns
                animation: 150,  // Smooth animation
                ghostClass: 'sortable-ghost', // Class for the drop placeholder
                dragClass: 'sortable-drag',   // Class for the dragging item
                delay: 100, // Delay to prevent accidental drags on touch
                delayOnTouchOnly: true,
                onStart: () => {
                    this.isDragging = true;
                },
                onEnd: (evt) => {
                    this.isDragging = false;
                    const itemEl = evt.item;
                    const newStatus = evt.to.dataset.status;
                    const oldStatus = evt.from.dataset.status;
                    const cardId = itemEl.dataset.id;

                    // Update state if moved to a different column or reordered (though reorder in same column doesn't change status, we might want to save order eventually. For now US says update status)
                    // Even if reordered in same column, we might want to save state if we were tracking order.
                    // But current requirement is "update status".
                    // However, we should always update counts and save if anything changed?
                    // If moved to same column, status is same.

                    if (newStatus !== oldStatus) {
                         this.handleCardMove(cardId, newStatus);
                    }
                }
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

        // DOM is already updated by SortableJS
        this.updateCounts();

        // Trigger save
        this.saveState();
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
     * Migrate card from legacy status to new status (V1 -> V2)
     * Persists substatus for cards migrated from 'todo' or 'doing'
     */
    migrateCardStatus(cardId, newStatus, originalStatus) {
        const currentState = this.kanbanState[cardId];

        // Only migrate if not already migrated
        if (currentState && typeof currentState === 'object' && currentState.substatus) {
            return; // Already has substatus, skip migration
        }

        const substatusLabels = {
            'todo': 'A Fazer',
            'doing': 'Em Andamento'
        };

        if (typeof currentState === 'object' && currentState !== null) {
            this.kanbanState[cardId].status = newStatus;
            this.kanbanState[cardId].substatus = originalStatus;
            this.kanbanState[cardId].substatusLabel = substatusLabels[originalStatus] || originalStatus;
            this.kanbanState[cardId].migratedAt = new Date().toISOString();
        } else {
            this.kanbanState[cardId] = {
                status: newStatus,
                substatus: originalStatus,
                substatusLabel: substatusLabels[originalStatus] || originalStatus,
                migratedAt: new Date().toISOString()
            };
        }

        // Note: We don't save immediately here to avoid multiple saves during render.
        // The state will be saved when the user makes the next interaction.
        this._hasPendingMigration = true;
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

        // Editor Events
        const closeBtn = document.getElementById('close-editor');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeEditor());

        if (this.editorOverlayEl) {
            this.editorOverlayEl.addEventListener('click', () => this.closeEditor());
        }

        if (this.editorForm) {
            this.editorForm.addEventListener('submit', (e) => this.handleEditorSave(e));
        }
    }

    /**
     * Open the card editor
     */
    openEditor(cardId) {
        const card = this.interventions.find(c => c.id === cardId);
        if (!card) return;

        this.currentEditingCardId = cardId;
        const state = this.kanbanState[cardId] || {};

        // Populate Read-Only Fields
        document.getElementById('editor-card-id').textContent = card.id;
        document.getElementById('editor-card-title').textContent = card.title;
        document.getElementById('editor-article-source').textContent = `${card.articleTitle} (Artigo ${card.articleId})`;
        document.getElementById('editor-description').textContent = card.description;

        const viewSourceBtn = document.getElementById('editor-view-source');
        viewSourceBtn.href = card.link;

        // Populate Editable Fields
        document.getElementById('edit-responsible').value = state.responsible || '';
        document.getElementById('edit-duedate').value = state.dueDate || '';
        document.getElementById('edit-updates').value = state.updates || '';

        // Show Editor
        this.editorEl.classList.add('active');
        this.editorOverlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the card editor
     */
    closeEditor() {
        this.editorEl.classList.remove('active');
        this.editorOverlayEl.classList.remove('active');
        document.body.style.overflow = '';
        this.currentEditingCardId = null;

        // Reset status message
        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) statusEl.textContent = '';
    }

    /**
     * Handle form submission
     */
    async handleEditorSave(e) {
        e.preventDefault();
        if (!this.currentEditingCardId) return;

        const id = this.currentEditingCardId;
        const responsible = document.getElementById('edit-responsible').value;
        const dueDate = document.getElementById('edit-duedate').value;
        const updates = document.getElementById('edit-updates').value;

        // Update local state
        if (!this.kanbanState[id]) {
            this.kanbanState[id] = { status: 'backlog' }; // Default if new
        }

        // If it was a string (legacy), convert to object
        if (typeof this.kanbanState[id] === 'string') {
            this.kanbanState[id] = { status: this.kanbanState[id] };
        }

        this.kanbanState[id] = {
            ...this.kanbanState[id],
            responsible,
            dueDate,
            updates,
            updatedAt: new Date().toISOString()
        };

        // Show saving feedback in the form
        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) {
            statusEl.textContent = 'Salvando...';
            statusEl.style.color = 'var(--color-text-muted)';
        }

        // Trigger global save
        await this.saveState();

        // Update feedback
        if (statusEl) {
            statusEl.textContent = 'Salvo com sucesso!';
            statusEl.style.color = 'var(--color-success)';
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
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
