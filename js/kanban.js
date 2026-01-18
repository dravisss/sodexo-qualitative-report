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
        this.tagsContainer = document.getElementById('tags-container');
        this.tagsInput = document.getElementById('edit-tags');
        this.currentEditingCardId = null;
        this.currentEditingTags = []; // Track tags being edited
        this.currentEditingStakeholders = []; // Track stakeholders being edited

        // Search Elements
        this.searchInput = document.getElementById('kanban-search');
        this.searchDebounceTimer = null;

        // Stakeholder Editor Elements
        this.stakeholdersList = document.getElementById('stakeholders-list');
        this.stakeholderForm = document.getElementById('stakeholder-form');
        this.addStakeholderBtn = document.getElementById('add-stakeholder-btn');

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

        // Group cards by status
        const cardsByStatus = {};
        this.columns.forEach(col => {
            cardsByStatus[col.id] = [];
        });

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

            if (cardsByStatus[status]) {
                cardsByStatus[status].push({ card, originalStatus });
            }
        });

        // Render cards in each column, respecting saved order
        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            if (!colBody) return;

            let cardsToRender = cardsByStatus[col.id];

            // Apply saved order if available
            const savedOrder = this.kanbanState._columnOrder?.[col.id];
            if (savedOrder && savedOrder.length > 0) {
                // Sort cards based on saved order
                const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]));
                cardsToRender.sort((a, b) => {
                    const orderA = orderMap.has(a.card.id) ? orderMap.get(a.card.id) : Infinity;
                    const orderB = orderMap.has(b.card.id) ? orderMap.get(b.card.id) : Infinity;
                    // Cards not in saved order go to the end, sorted by ID
                    if (orderA === Infinity && orderB === Infinity) {
                        const numA = parseInt(a.card.id.replace('I-', ''));
                        const numB = parseInt(b.card.id.replace('I-', ''));
                        return numA - numB;
                    }
                    return orderA - orderB;
                });
            }

            // Render the cards
            cardsToRender.forEach(({ card, originalStatus }) => {
                const cardEl = this.createCardElement(card, originalStatus);
                colBody.appendChild(cardEl);
            });
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

        // Get user tags from state
        const userTags = (state && typeof state === 'object' && Array.isArray(state.tags)) ? state.tags : [];

        // Get stakeholders from state for badge
        const stakeholders = (state && typeof state === 'object' && Array.isArray(state.stakeholders)) ? state.stakeholders : [];
        const stakeholdersBadgeHtml = stakeholders.length > 0
            ? `<span class="card-stakeholders-badge" title="${stakeholders.map(s => this.escapeHtml(s.name)).join(', ')}">👥${stakeholders.length}</span>`
            : '';

        el.innerHTML = `
            <div class="card-header">
                <div class="card-id">${card.id}</div>
                ${substatusHtml}
                ${stakeholdersBadgeHtml}
            </div>
            <div class="card-title">${card.title}</div>
            <div class="card-tags">
                ${this.generateCardTagsHtml(card, userTags)}
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
                chosenClass: 'sortable-chosen', // Class for the chosen item (before drag starts)
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

                    if (newStatus !== oldStatus) {
                        // Moved to a different column - update status and save order
                        this.handleCardMove(cardId, newStatus, evt.to);
                        // Also save the order of the source column
                        this.saveColumnOrder(evt.from);
                    } else {
                        // Reordered within the same column - just save order
                        this.handleCardReorder(evt.to);
                    }
                }
            });
        });
    }

    handleCardMove(cardId, newStatus, newColumn) {
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

        // Set default substatus when moving to 'doing' (Em andamento)
        if (newStatus === 'doing') {
            this.kanbanState[cardId].substatus = 'todo';
            this.kanbanState[cardId].substatusLabel = 'A Fazer';
            // Update the card's substatus badge in the DOM
            this.updateCardSubstatus(cardId, 'A Fazer');
        } else {
            // Clear substatus when moving to other columns
            delete this.kanbanState[cardId].substatus;
            delete this.kanbanState[cardId].substatusLabel;
            this.updateCardSubstatus(cardId, null);
        }

        // Save column order
        if (newColumn) {
            this.saveColumnOrder(newColumn);
        }

        // DOM is already updated by SortableJS
        this.updateCounts();

        // Trigger save
        this.saveState();
    }

    /**
     * Update card substatus badge in the DOM
     */
    updateCardSubstatus(cardId, label) {
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        if (!cardEl) return;

        const headerEl = cardEl.querySelector('.card-header');
        if (!headerEl) return;

        // Remove existing substatus badge
        const existingBadge = headerEl.querySelector('.card-substatus');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Add new badge if label provided
        if (label) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'card-substatus';
            badgeEl.textContent = label;
            headerEl.appendChild(badgeEl);
        }
    }

    /**
     * Save the order of cards in a column
     */
    saveColumnOrder(columnEl) {
        const status = columnEl.dataset.status;
        const cardIds = Array.from(columnEl.querySelectorAll('.kanban-card'))
            .map(card => card.dataset.id);

        // Store order in global state
        if (!this.kanbanState._columnOrder) {
            this.kanbanState._columnOrder = {};
        }
        this.kanbanState._columnOrder[status] = cardIds;
    }

    /**
     * Handle reordering within the same column
     */
    handleCardReorder(columnEl) {
        this.saveColumnOrder(columnEl);
        this.saveState();
    }

    updateCounts() {
        this.columns.forEach(col => {
            const colBody = document.querySelector(`#col-${col.id} .kanban-column-body`);
            const countEl = document.querySelector(`#col-${col.id} .column-count`);
            if (colBody && countEl) {
                // Count only visible cards
                const visibleCards = Array.from(colBody.children).filter(
                    card => card.style.display !== 'none'
                );
                countEl.textContent = visibleCards.length;
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

        // Tags Input Events
        if (this.tagsInput) {
            this.tagsInput.addEventListener('keydown', (e) => this.handleTagInput(e));
        }

        // Stakeholder Events
        if (this.addStakeholderBtn) {
            this.addStakeholderBtn.addEventListener('click', () => this.showStakeholderForm());
        }

        const stakeholderSaveBtn = document.getElementById('stakeholder-save');
        if (stakeholderSaveBtn) {
            stakeholderSaveBtn.addEventListener('click', () => this.saveStakeholder());
        }

        const stakeholderCancelBtn = document.getElementById('stakeholder-cancel');
        if (stakeholderCancelBtn) {
            stakeholderCancelBtn.addEventListener('click', () => this.hideStakeholderForm());
        }

        // Search Events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearchInput());
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

        // Populate Tags
        this.currentEditingTags = Array.isArray(state.tags) ? [...state.tags] : [];
        this.renderEditorTags();

        // Populate Stakeholders
        this.currentEditingStakeholders = Array.isArray(state.stakeholders) ? [...state.stakeholders] : [];
        this.renderEditorStakeholders();
        this.hideStakeholderForm();

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
        this.currentEditingTags = [];
        this.currentEditingStakeholders = [];

        // Reset status message
        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) statusEl.textContent = '';
    }

    /**
     * Render tags in the editor as chips
     */
    renderEditorTags() {
        if (!this.tagsContainer) return;

        this.tagsContainer.innerHTML = this.currentEditingTags.map(tag => `
            <span class="tag-chip" data-tag="${this.escapeHtml(tag)}">
                ${this.escapeHtml(tag)}
                <button type="button" class="tag-chip-remove" aria-label="Remover tag">×</button>
            </span>
        `).join('');

        // Add click handlers for remove buttons
        this.tagsContainer.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const chip = btn.closest('.tag-chip');
                const tag = chip.dataset.tag;
                this.removeTag(tag);
            });
        });
    }

    /**
     * Handle tag input (Enter or comma)
     */
    handleTagInput(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = this.tagsInput.value.trim();

            // Handle comma-separated input
            if (e.key === ',') {
                // Remove trailing comma from input
                const cleanValue = value.replace(/,+$/, '').trim();
                if (cleanValue) {
                    this.addTag(cleanValue);
                }
            } else if (value) {
                this.addTag(value);
            }

            this.tagsInput.value = '';
        }
    }

    /**
     * Add a tag with normalization and duplicate prevention
     */
    addTag(rawTag) {
        // Normalize: trim whitespace
        const tag = rawTag.trim();
        if (!tag) return;

        // Check for duplicates (case-insensitive)
        const tagLower = tag.toLowerCase();
        const exists = this.currentEditingTags.some(t => t.toLowerCase() === tagLower);

        if (!exists) {
            this.currentEditingTags.push(tag);
            this.renderEditorTags();
        }
    }

    /**
     * Remove a tag
     */
    removeTag(tag) {
        const index = this.currentEditingTags.indexOf(tag);
        if (index > -1) {
            this.currentEditingTags.splice(index, 1);
            this.renderEditorTags();
        }
    }

    /**
     * Show the stakeholder add form
     */
    showStakeholderForm() {
        if (this.stakeholderForm) {
            this.stakeholderForm.style.display = 'flex';
            this.addStakeholderBtn.style.display = 'none';
            document.getElementById('stakeholder-name').focus();
        }
    }

    /**
     * Hide the stakeholder add form
     */
    hideStakeholderForm() {
        if (this.stakeholderForm) {
            this.stakeholderForm.style.display = 'none';
            this.addStakeholderBtn.style.display = 'block';
            // Clear form inputs
            document.getElementById('stakeholder-name').value = '';
            document.getElementById('stakeholder-area').value = '';
            document.getElementById('stakeholder-contact').value = '';
        }
    }

    /**
     * Save a new stakeholder from the form
     */
    saveStakeholder() {
        const name = document.getElementById('stakeholder-name').value.trim();
        const area = document.getElementById('stakeholder-area').value.trim();
        const contact = document.getElementById('stakeholder-contact').value.trim();

        if (!name) {
            document.getElementById('stakeholder-name').focus();
            return;
        }

        this.currentEditingStakeholders.push({ name, area, contact });
        this.renderEditorStakeholders();
        this.hideStakeholderForm();
    }

    /**
     * Remove a stakeholder by index
     */
    removeStakeholder(index) {
        if (index >= 0 && index < this.currentEditingStakeholders.length) {
            this.currentEditingStakeholders.splice(index, 1);
            this.renderEditorStakeholders();
        }
    }

    /**
     * Render stakeholders in the editor
     */
    renderEditorStakeholders() {
        if (!this.stakeholdersList) return;

        if (this.currentEditingStakeholders.length === 0) {
            this.stakeholdersList.innerHTML = '';
            return;
        }

        this.stakeholdersList.innerHTML = this.currentEditingStakeholders.map((stakeholder, index) => {
            const details = [];
            if (stakeholder.area) details.push(`<span>📍 ${this.escapeHtml(stakeholder.area)}</span>`);
            if (stakeholder.contact) details.push(`<span>📞 ${this.escapeHtml(stakeholder.contact)}</span>`);

            return `
                <div class="stakeholder-item" data-index="${index}">
                    <div class="stakeholder-info">
                        <span class="stakeholder-name">${this.escapeHtml(stakeholder.name)}</span>
                        ${details.length > 0 ? `<div class="stakeholder-details">${details.join('')}</div>` : ''}
                    </div>
                    <button type="button" class="stakeholder-remove" aria-label="Remover pessoa">×</button>
                </div>
            `;
        }).join('');

        // Add click handlers for remove buttons
        this.stakeholdersList.querySelectorAll('.stakeholder-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const item = btn.closest('.stakeholder-item');
                const index = parseInt(item.dataset.index, 10);
                this.removeStakeholder(index);
            });
        });
    }

    /**
     * Escape HTML for safe rendering
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Update card tags display in the DOM
     */
    updateCardTagsDisplay(cardId, tags) {
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        if (!cardEl) return;

        const tagsEl = cardEl.querySelector('.card-tags');
        if (!tagsEl) return;

        // Find the card data to get article title
        const card = this.interventions.find(c => c.id === cardId);
        if (!card) return;

        // Generate tags HTML
        tagsEl.innerHTML = this.generateCardTagsHtml(card, tags);
    }

    /**
     * Update card stakeholders badge in the DOM
     */
    updateCardStakeholdersBadge(cardId, stakeholders) {
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        if (!cardEl) return;

        const headerEl = cardEl.querySelector('.card-header');
        if (!headerEl) return;

        // Remove existing badge
        const existingBadge = headerEl.querySelector('.card-stakeholders-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        // Add new badge if stakeholders exist
        if (stakeholders && stakeholders.length > 0) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'card-stakeholders-badge';
            badgeEl.textContent = `👥${stakeholders.length}`;
            badgeEl.title = stakeholders.map(s => s.name).join(', ');
            headerEl.appendChild(badgeEl);
        }
    }

    /**
     * Generate HTML for card tags (article source + user tags with +N indicator)
     */
    generateCardTagsHtml(card, userTags = []) {
        const tagsHtml = [];

        // Always show article origin tag first
        tagsHtml.push(`<span class="card-tag" title="${this.escapeHtml(card.articleTitle)}">${this.escapeHtml(card.articleTitle)}</span>`);

        // Show up to 2 user tags
        const visibleTags = userTags.slice(0, 2);
        const remainingCount = userTags.length - 2;

        visibleTags.forEach(tag => {
            tagsHtml.push(`<span class="card-tag user-tag">${this.escapeHtml(tag)}</span>`);
        });

        // Show +N indicator if more than 2 tags
        if (remainingCount > 0) {
            tagsHtml.push(`<span class="card-tag more-tags">+${remainingCount}</span>`);
        }

        return tagsHtml.join('');
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
        const tags = [...this.currentEditingTags]; // Copy current tags
        const stakeholders = [...this.currentEditingStakeholders]; // Copy current stakeholders

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
            tags,
            stakeholders,
            updatedAt: new Date().toISOString()
        };

        // Update the card's tags display in the DOM
        this.updateCardTagsDisplay(id, tags);

        // Update the card's stakeholders badge in the DOM
        this.updateCardStakeholdersBadge(id, stakeholders);

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

    /**
     * Handle search input with debounce
     */
    handleSearchInput() {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.filterCards(this.searchInput.value);
        }, 300);
    }

    /**
     * Filter cards based on search query
     * Matches: ID (I-XX), title, any tag, stakeholder name/area/contact
     */
    filterCards(query) {
        const normalizedQuery = query.trim().toLowerCase();
        const allCards = document.querySelectorAll('.kanban-card');

        allCards.forEach(cardEl => {
            const cardId = cardEl.dataset.id;
            const card = this.interventions.find(c => c.id === cardId);
            if (!card) return;

            // If query is empty, show all cards
            if (!normalizedQuery) {
                cardEl.style.display = '';
                return;
            }

            // Check for match
            const isMatch = this.cardMatchesQuery(card, normalizedQuery);
            cardEl.style.display = isMatch ? '' : 'none';
        });

        // Update column counts after filtering
        this.updateCounts();
    }

    /**
     * Check if a card matches the search query
     */
    cardMatchesQuery(card, query) {
        // Match ID (I-XX)
        if (card.id.toLowerCase().includes(query)) {
            return true;
        }

        // Match title
        if (card.title.toLowerCase().includes(query)) {
            return true;
        }

        // Get state for tags and stakeholders
        const state = this.kanbanState[card.id];

        // Match tags
        if (state && Array.isArray(state.tags)) {
            for (const tag of state.tags) {
                if (tag.toLowerCase().includes(query)) {
                    return true;
                }
            }
        }

        // Match stakeholders (name, area, contact)
        if (state && Array.isArray(state.stakeholders)) {
            for (const stakeholder of state.stakeholders) {
                if (stakeholder.name && stakeholder.name.toLowerCase().includes(query)) {
                    return true;
                }
                if (stakeholder.area && stakeholder.area.toLowerCase().includes(query)) {
                    return true;
                }
                if (stakeholder.contact && stakeholder.contact.toLowerCase().includes(query)) {
                    return true;
                }
            }
        }

        return false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanManager = new KanbanManager();
});
