/**
 * Kanban Manager
 * Handles the interactive Kanban board for intervention management
 */

import { ARTICLES } from './config.js';

class KanbanManager {
    constructor() {
        this.boardEl = document.getElementById('kanban-board');
        this.timelineEl = document.getElementById('kanban-timeline');
        this.sidebarEl = document.querySelector('.sin-sidebar');
        this.overlayEl = document.getElementById('sidebar-overlay');

        // Editor Elements
        this.editorEl = document.getElementById('card-editor');
        this.editorOverlayEl = document.getElementById('card-editor-overlay');
        this.editorForm = document.getElementById('card-edit-form');
        this.tagsContainer = document.getElementById('tags-container');
        this.tagsInput = document.getElementById('edit-tags');
        this.startDateInput = document.getElementById('edit-startdate');
        this.endDateInput = document.getElementById('edit-enddate');
        this.substatusGroup = document.getElementById('substatus-group');
        this.substatusSelect = document.getElementById('edit-substatus');
        this.attachmentsListEl = document.getElementById('attachments-list');
        this.addAttachmentBtn = document.getElementById('add-attachment-btn');
        this.attachmentFileInput = document.getElementById('attachment-file-input');
        this.currentEditingCardId = null;
        this.currentEditingTags = []; // Track tags being edited
        this.currentEditingStakeholders = []; // Track stakeholders being edited
        this.currentEditingAttachments = []; // Track attachments being edited

        this.editorAutosaveTimer = null;
        this.editorAutosaveDelayMs = 800;

        // Search Elements
        this.searchInput = document.getElementById('kanban-search');
        this.searchDebounceTimer = null;

        // Tag Filter Elements
        this.tagPickerToggle = document.getElementById('tag-picker-toggle');
        this.tagPickerDropdown = document.getElementById('tag-picker-dropdown');
        this.selectedTagsChips = document.getElementById('selected-tags-chips');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
        this.selectedFilterTags = []; // Tags selected for filtering

        // View + Mobile Tabs
        this.viewBoardBtn = document.getElementById('view-board');
        this.viewTimelineBtn = document.getElementById('view-timeline');
        this.mobileTabsEl = document.getElementById('kanban-mobile-tabs');
        this.activeMobileStatus = 'backlog';
        this.currentView = 'board';

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
        this.API_URL = '/.netlify/functions/kanban-state';
        this.ATTACHMENT_API_URL = '/.netlify/functions/kanban-attachment';

        this.init();
    }

    loadLocalStateFallback() {
        try {
            return JSON.parse(localStorage.getItem('kanban_state') || '{}');
        } catch {
            return {};
        }
    }

    isEmptyObject(obj) {
        return !!obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0;
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
        this.applyFilters();
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
                try {
                    const remote = await response.json();
                    const local = this.loadLocalStateFallback();

                    // If remote is empty but local has content, prefer local (common in local dev)
                    if (this.isEmptyObject(remote) && !this.isEmptyObject(local)) {
                        this.kanbanState = local;
                        console.log('Remote state empty; using localStorage state instead.');
                        return;
                    }

                    this.kanbanState = remote;
                    console.log('Remote state loaded:', this.kanbanState);
                    return;
                } catch (parseError) {
                    console.warn('Remote state response was not valid JSON; falling back to localStorage.', parseError);
                }
            }

            // Non-2xx or invalid JSON: fall back to local state
            this.kanbanState = this.loadLocalStateFallback();
        } catch (error) {
            console.error('Error loading remote state:', error);
            // Fallback to local storage if available or empty
            this.kanbanState = this.loadLocalStateFallback();
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

            // Avoid overwriting a non-empty local state with an empty remote response
            if (this.isEmptyObject(remoteState) && !this.isEmptyObject(this.kanbanState)) {
                return;
            }

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

                // Extract content HTML until next header
                let contentHtml = '';
                let contentText = '';
                let next = header.nextElementSibling;
                while (next && !['H1', 'H2', 'H3', 'H4', 'HR'].includes(next.tagName)) {
                    contentHtml += next.outerHTML;
                    contentText += next.textContent + ' ';
                    next = next.nextElementSibling;
                }

                // Extract the 4 fields from HTML content (case-insensitive)
                const fields = this.extractInterventionFields(contentHtml);

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
                    link: `index.html#${article.id}`,
                    // Full content fields for editor details
                    tensao: fields.tensao,
                    descricao: fields.descricao,
                    objetivo: fields.objetivo,
                    impacto: fields.impacto
                });
            }
        });

        return found;
    }

    /**
     * Extract Tensão, Descrição, Objetivo, Impacto fields from HTML content
     * Returns HTML content preserving formatting (bold, lists, etc.)
     */
    extractInterventionFields(html) {
        // Default fallback value
        const fallback = '—';
        const labels = ['Tensão', 'Descrição', 'Objetivo', 'Impacto'];
        const result = {
            tensao: fallback,
            descricao: fallback,
            objetivo: fallback,
            impacto: fallback
        };

        // Helper to find label matches
        const matches = [];
        labels.forEach(label => {
            // Match: <strong>Label:</strong> or <strong>Label</strong>: or <b>...
            // We use a simplified regex to find the start position
            // We look for <strong/b> followed by the label
            const regex = new RegExp(`<[sb](?:trong)?>\\s*${label}`, 'gi');
            let match;
            while ((match = regex.exec(html)) !== null) {
                matches.push({
                    label: label,
                    index: match.index
                });
            }
        });

        // Sort matches by index to process in order
        matches.sort((a, b) => a.index - b.index);

        matches.forEach((m, i) => {
            const nextMatch = matches[i + 1];
            const startIndex = m.index;
            const endIndex = nextMatch ? nextMatch.index : html.length;

            // Extract the chunk
            let chunk = html.substring(startIndex, endIndex);

            // Remove the label itself from the beginning of the chunk
            // Regex to match the full label tag: <strong>Label:?</strong>:?
            const labelStripRegex = new RegExp(`^<[sb](?:trong)?>\\s*${m.label}:?\\s*<\\/[sb](?:trong)?>:?`, 'i');
            chunk = chunk.replace(labelStripRegex, '');

            // Clean up leading artifacts
            // If extracting from <p><strong>Label:</strong> Content</p>, we have " Content</p>"
            // If extracting from <p><strong>Label:</strong></p><ul>... we have "</p><ul>..."

            // Remove leading </p> if it was a standalone label line
            chunk = chunk.replace(/^\s*<\/[pP]>\s*/, '');

            // Clean up trailing artifacts
            // If the chunk ends where the next label starts, and the next label is in a new <p>,
            // the chunk might end with <p> (start of next paragraph).
            chunk = chunk.replace(/\s*<[pP]>\s*$/, '');

            // Trim whitespace
            chunk = chunk.trim();

            if (chunk && chunk.length > 0) {
                const key = m.label.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
                result[key] = chunk;
            }
        });

        return result;
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

        // Apply mobile visibility (if needed)
        this.applyMobileColumnVisibility();
    }

    createCardElement(card, originalStatus = null) {
        const el = document.createElement('div');
        el.className = 'kanban-card';
        el.dataset.id = card.id;

        // Get substatus from state if not passed directly
        const state = this.kanbanState[card.id];
        let substatusLabel = null;
        if (originalStatus) {
            const labels = { 'todo': 'A fazer', 'doing': 'Fazendo' };
            substatusLabel = labels[originalStatus];
        } else if (state && typeof state === 'object') {
            if (state.substatus === 'todo') substatusLabel = 'A fazer';
            if (state.substatus === 'doing') substatusLabel = 'Fazendo';
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

        // Get attachments from state for badge
        const attachments = (state && typeof state === 'object' && Array.isArray(state.attachments)) ? state.attachments : [];
        const attachmentsBadgeHtml = attachments.length > 0
            ? `<span class="card-attachments-badge" title="${attachments.length} anexo(s)">📎${attachments.length}</span>`
            : '';

        const datesHtml = this.getCardDatesHtml(state);

        el.innerHTML = `
            <div class="card-header">
                <div class="card-id">${card.id}</div>
                ${substatusHtml}
                ${stakeholdersBadgeHtml}
                ${attachmentsBadgeHtml}
            </div>
            <div class="card-title">${card.title}</div>
            <div class="card-tags">
                ${this.generateCardTagsHtml(card, userTags)}
            </div>
            ${datesHtml}
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
            if (!this.kanbanState[cardId].substatus) {
                this.kanbanState[cardId].substatus = 'todo';
            }
            const label = this.kanbanState[cardId].substatus === 'doing' ? 'Fazendo' : 'A fazer';
            this.updateCardSubstatus(cardId, label);
        } else {
            // Clear substatus when moving to other columns
            delete this.kanbanState[cardId].substatus;
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

        if (this.currentView === 'timeline') {
            this.renderTimeline();
        }
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
            'todo': 'A fazer',
            'doing': 'Fazendo'
        };

        if (typeof currentState === 'object' && currentState !== null) {
            this.kanbanState[cardId].status = newStatus;
            this.kanbanState[cardId].substatus = originalStatus;
            this.kanbanState[cardId].migratedAt = new Date().toISOString();
        } else {
            this.kanbanState[cardId] = {
                status: newStatus,
                substatus: originalStatus,
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
            this.setupEditorAutosave();
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

        // Tag Filter Events
        if (this.tagPickerToggle) {
            this.tagPickerToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTagPicker();
            });
        }

        // Close tag picker when clicking outside
        document.addEventListener('click', (e) => {
            if (this.tagPickerDropdown &&
                !this.tagPickerDropdown.contains(e.target) &&
                !this.tagPickerToggle.contains(e.target)) {
                this.closeTagPicker();
            }
        });

        // Clear filters button
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // View toggle
        if (this.viewBoardBtn && this.viewTimelineBtn) {
            this.viewBoardBtn.addEventListener('click', () => this.setView('board'));
            this.viewTimelineBtn.addEventListener('click', () => this.setView('timeline'));
        }

        // Mobile tabs
        if (this.mobileTabsEl) {
            this.mobileTabsEl.querySelectorAll('.mobile-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.setActiveMobileStatus(btn.dataset.status);
                });
            });
            window.addEventListener('resize', () => this.applyMobileColumnVisibility());
        }

        // Attachments
        if (this.addAttachmentBtn && this.attachmentFileInput) {
            this.addAttachmentBtn.addEventListener('click', () => {
                if (!this.currentEditingCardId) return;
                this.attachmentFileInput.click();
            });
            this.attachmentFileInput.addEventListener('change', async () => {
                await this.handleAttachmentFilesSelected();
            });
        }
    }

    setView(view) {
        if (view !== 'board' && view !== 'timeline') return;
        this.currentView = view;

        if (this.viewBoardBtn && this.viewTimelineBtn) {
            const isBoard = view === 'board';
            this.viewBoardBtn.classList.toggle('active', isBoard);
            this.viewTimelineBtn.classList.toggle('active', !isBoard);
            this.viewBoardBtn.setAttribute('aria-selected', isBoard ? 'true' : 'false');
            this.viewTimelineBtn.setAttribute('aria-selected', !isBoard ? 'true' : 'false');
        }

        if (this.boardEl) {
            this.boardEl.style.display = view === 'board' ? '' : 'none';
        }
        if (this.timelineEl) {
            this.timelineEl.style.display = view === 'timeline' ? '' : 'none';
        }

        if (this.mobileTabsEl) {
            this.mobileTabsEl.style.display = (view === 'board') ? '' : 'none';
        }

        if (view === 'timeline') {
            this.renderTimeline();
        } else {
            this.applyFilters();
            this.applyMobileColumnVisibility();
        }
    }

    setActiveMobileStatus(status) {
        if (!status) return;
        this.activeMobileStatus = status;
        if (this.mobileTabsEl) {
            this.mobileTabsEl.querySelectorAll('.mobile-tab').forEach(btn => {
                const isActive = btn.dataset.status === status;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }
        this.applyMobileColumnVisibility();
    }

    applyMobileColumnVisibility() {
        if (!this.mobileTabsEl) return;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (this.currentView !== 'board') {
            // Ensure columns are visible when leaving board
            this.columns.forEach(col => {
                const colEl = document.getElementById(`col-${col.id}`);
                if (colEl) colEl.style.display = '';
            });
            return;
        }

        if (!isMobile) {
            this.columns.forEach(col => {
                const colEl = document.getElementById(`col-${col.id}`);
                if (colEl) colEl.style.display = '';
            });
            return;
        }

        this.columns.forEach(col => {
            const colEl = document.getElementById(`col-${col.id}`);
            if (!colEl) return;
            colEl.style.display = (col.id === this.activeMobileStatus) ? '' : 'none';
        });
    }

    /**
     * Open the card editor
     */
    openEditor(cardId) {
        const card = this.interventions.find(c => c.id === cardId);
        if (!card) return;

        this.currentEditingCardId = cardId;
        let state = this.kanbanState[cardId] || {};
        if (typeof state === 'string') {
            state = { status: state };
        }

        // Populate Read-Only Fields
        document.getElementById('editor-card-id').textContent = card.id;
        document.getElementById('editor-card-title').textContent = card.title;
        document.getElementById('editor-article-source').textContent = `${card.articleTitle} (Artigo ${card.articleId})`;

        // Populate the 4 collapsible detail sections
        this.populateDetailSection('editor-tensao', card.tensao);
        this.populateDetailSection('editor-descricao', card.descricao);
        this.populateDetailSection('editor-objetivo', card.objetivo);
        this.populateDetailSection('editor-impacto', card.impacto);

        const viewSourceBtn = document.getElementById('editor-view-source');
        viewSourceBtn.href = card.link;

        // Populate Editable Fields
        document.getElementById('edit-responsible').value = state.responsible || '';
        if (this.startDateInput) this.startDateInput.value = state.startDate || '';
        if (this.endDateInput) this.endDateInput.value = state.endDate || '';
        document.getElementById('edit-updates').value = state.updates || '';

        // Substatus only relevant in 'doing'
        if (this.substatusGroup && this.substatusSelect) {
            const isDoing = (state && typeof state === 'object' && state.status === 'doing');
            this.substatusGroup.style.display = isDoing ? '' : 'none';
            if (isDoing) {
                this.substatusSelect.value = state.substatus === 'doing' ? 'doing' : 'todo';
            }
        }

        // Populate Tags
        this.currentEditingTags = Array.isArray(state.tags) ? [...state.tags] : [];
        this.renderEditorTags();

        // Populate Stakeholders
        this.currentEditingStakeholders = Array.isArray(state.stakeholders) ? [...state.stakeholders] : [];
        this.renderEditorStakeholders();
        this.hideStakeholderForm();

        // Populate Attachments
        this.currentEditingAttachments = Array.isArray(state.attachments) ? [...state.attachments] : [];
        this.renderEditorAttachments();

        // Show Editor
        this.editorEl.classList.add('active');
        this.editorOverlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Populate a detail section with HTML content
     * Preserves formatting and shows fallback for empty content
     */
    populateDetailSection(elementId, content) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const fallback = '—';
        if (!content || content === fallback) {
            el.textContent = fallback;
            el.classList.add('empty-content');
        } else {
            el.innerHTML = content;
            el.classList.remove('empty-content');
        }
    }

    /**
     * Close the card editor
     */
    closeEditor() {
        if (this.currentEditingCardId && this.editorAutosaveTimer) {
            clearTimeout(this.editorAutosaveTimer);
            this.editorAutosaveTimer = null;
            this.handleEditorSave({ preventDefault: () => { }, _autosave: true });
        }
        this.editorEl.classList.remove('active');
        this.editorOverlayEl.classList.remove('active');
        document.body.style.overflow = '';
        this.currentEditingCardId = null;
        this.currentEditingTags = [];
        this.currentEditingStakeholders = [];
        this.currentEditingAttachments = [];

        if (this.attachmentFileInput) {
            this.attachmentFileInput.value = '';
        }

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
            this.scheduleEditorAutosave();
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
            this.scheduleEditorAutosave();
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
        this.scheduleEditorAutosave();
    }

    /**
     * Remove a stakeholder by index
     */
    removeStakeholder(index) {
        if (index >= 0 && index < this.currentEditingStakeholders.length) {
            this.currentEditingStakeholders.splice(index, 1);
            this.renderEditorStakeholders();
            this.scheduleEditorAutosave();
        }
    }

    setupEditorAutosave() {
        if (!this.editorForm) return;

        const handler = () => this.scheduleEditorAutosave();
        const fields = this.editorForm.querySelectorAll('input, textarea, select');

        fields.forEach(el => {
            if (!el) return;
            if (el.id === 'edit-tags') return;
            if (el.id === 'stakeholder-name') return;
            if (el.id === 'stakeholder-area') return;
            if (el.id === 'stakeholder-contact') return;
            if (el.type === 'file') return;
            el.addEventListener('input', handler);
            el.addEventListener('change', handler);
        });
    }

    scheduleEditorAutosave() {
        if (!this.currentEditingCardId) return;

        if (this.editorAutosaveTimer) {
            clearTimeout(this.editorAutosaveTimer);
        }

        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) {
            statusEl.textContent = 'Salvando...';
            statusEl.style.color = 'var(--color-text-muted)';
        }

        this.editorAutosaveTimer = setTimeout(() => {
            this.editorAutosaveTimer = null;
            this.handleEditorSave({ preventDefault: () => { }, _autosave: true });
        }, this.editorAutosaveDelayMs);
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

    renderEditorAttachments() {
        if (!this.attachmentsListEl) return;

        if (!this.currentEditingAttachments || this.currentEditingAttachments.length === 0) {
            this.attachmentsListEl.innerHTML = '';
            return;
        }

        this.attachmentsListEl.innerHTML = this.currentEditingAttachments.map(att => {
            const name = this.escapeHtml(att?.name || 'arquivo');
            const size = (typeof att?.size === 'number') ? this.formatBytes(att.size) : '';
            const blobKey = String(att?.blobKey || '');
            const downloadUrl = `${this.ATTACHMENT_API_URL}?key=${encodeURIComponent(blobKey)}`;

            return `
                <div class="attachment-item" data-blobkey="${this.escapeHtml(blobKey)}">
                    <div class="attachment-meta">
                        <div class="attachment-name">${name}</div>
                        <div class="attachment-submeta">${this.escapeHtml(size)}</div>
                    </div>
                    <div class="attachment-actions">
                        <a class="attachment-action" href="${downloadUrl}" target="_blank" rel="noopener">Download</a>
                        <button type="button" class="attachment-action danger" data-action="remove" data-blobkey="${this.escapeHtml(blobKey)}">Remover</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachmentsListEl.querySelectorAll('button[data-action="remove"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const blobKey = btn.dataset.blobkey;
                if (!blobKey) return;
                await this.removeAttachment(blobKey);
            });
        });
    }

    formatBytes(bytes) {
        if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    async handleAttachmentFilesSelected() {
        if (!this.currentEditingCardId || !this.attachmentFileInput) return;
        const files = Array.from(this.attachmentFileInput.files || []);
        if (files.length === 0) return;

        const allowedExt = ['pdf', 'csv', 'xls', 'xlsx', 'docx', 'pptx', 'png', 'jpg', 'jpeg'];
        const maxFileBytes = 10 * 1024 * 1024;
        const maxCardBytes = 50 * 1024 * 1024;

        const currentTotal = (this.currentEditingAttachments || []).reduce((sum, a) => sum + (a?.size || 0), 0);
        const selectedTotal = files.reduce((sum, f) => sum + (f?.size || 0), 0);

        if (currentTotal + selectedTotal > maxCardBytes) {
            this.showError('Limite de 50MB por card excedido.');
            this.attachmentFileInput.value = '';
            return;
        }

        for (const file of files) {
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            if (!allowedExt.includes(ext)) {
                this.showError(`Tipo de arquivo não suportado: ${file.name}`);
                continue;
            }
            if (file.size > maxFileBytes) {
                this.showError(`Arquivo maior que 10MB: ${file.name}`);
                continue;
            }

            await this.uploadAttachment(file);
        }

        this.attachmentFileInput.value = '';
    }

    async uploadAttachment(file) {
        const cardId = this.currentEditingCardId;
        if (!cardId) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('cardId', cardId);

        try {
            this.showSaving(true);
            const response = await fetch(this.ATTACHMENT_API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const payload = await response.json();
            if (!payload || !payload.blobKey) {
                throw new Error('Invalid upload response');
            }

            if (!this.kanbanState[cardId]) {
                this.kanbanState[cardId] = { status: 'backlog' };
            }
            if (typeof this.kanbanState[cardId] === 'string') {
                this.kanbanState[cardId] = { status: this.kanbanState[cardId] };
            }

            const state = this.kanbanState[cardId];
            state.attachments = Array.isArray(state.attachments) ? state.attachments : [];
            state.attachments.push({
                id: payload.id,
                name: payload.name,
                mime: payload.mime,
                size: payload.size,
                blobKey: payload.blobKey,
                createdAt: payload.createdAt
            });
            state.updatedAt = new Date().toISOString();

            this.currentEditingAttachments = [...state.attachments];
            this.renderEditorAttachments();
            this.updateCardAttachmentsBadge(cardId, state.attachments);

            await this.saveState();
        } catch (err) {
            console.error('Attachment upload error:', err);
            this.showError('Erro ao enviar anexo.');
        } finally {
            this.showSaving(false);
        }
    }

    async removeAttachment(blobKey) {
        const cardId = this.currentEditingCardId;
        if (!cardId) return;

        try {
            this.showSaving(true);
            await fetch(`${this.ATTACHMENT_API_URL}?key=${encodeURIComponent(blobKey)}`, { method: 'DELETE' });

            const state = this.kanbanState[cardId];
            if (state && typeof state === 'object') {
                if (Array.isArray(state.attachments)) {
                    state.attachments = state.attachments.filter(a => a?.blobKey !== blobKey);
                }
                state.updatedAt = new Date().toISOString();
            }

            this.currentEditingAttachments = Array.isArray(state?.attachments) ? [...state.attachments] : [];
            this.renderEditorAttachments();
            this.updateCardAttachmentsBadge(cardId, this.currentEditingAttachments);

            await this.saveState();
        } catch (err) {
            console.error('Attachment remove error:', err);
            this.showError('Erro ao remover anexo.');
        } finally {
            this.showSaving(false);
        }
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

    updateCardAttachmentsBadge(cardId, attachments) {
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        if (!cardEl) return;

        const headerEl = cardEl.querySelector('.card-header');
        if (!headerEl) return;

        const existingBadge = headerEl.querySelector('.card-attachments-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        if (attachments && attachments.length > 0) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'card-attachments-badge';
            badgeEl.textContent = `📎${attachments.length}`;
            badgeEl.title = `${attachments.length} anexo(s)`;
            headerEl.appendChild(badgeEl);
        }
    }

    updateCardDatesDisplay(cardId) {
        const cardEl = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        if (!cardEl) return;

        const existing = cardEl.querySelector('.card-dates');
        if (existing) {
            existing.remove();
        }

        const state = this.kanbanState[cardId];
        const datesHtml = this.getCardDatesHtml(state);
        if (!datesHtml) return;

        cardEl.insertAdjacentHTML('beforeend', datesHtml);
    }

    getCardDatesHtml(state) {
        if (!state || typeof state !== 'object') return '';
        const start = state.startDate || '';
        const end = state.endDate || '';
        if (!start && !end) return '';

        const startFmt = start ? this.formatDateBR(start) : '';
        const endFmt = end ? this.formatDateBR(end) : '';

        let text = '';
        if (startFmt && endFmt) {
            text = `📅 ${startFmt} → ${endFmt}`;
        } else {
            text = `📅 ${startFmt || endFmt}`;
        }

        return `<div class="card-dates">${text}</div>`;
    }

    formatDateBR(yyyyMmDd) {
        const m = String(yyyyMmDd || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return yyyyMmDd;
        return `${m[3]}/${m[2]}`;
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
        const startDate = this.startDateInput ? this.startDateInput.value : '';
        const endDate = this.endDateInput ? this.endDateInput.value : '';
        const updates = document.getElementById('edit-updates').value;
        const tags = [...this.currentEditingTags]; // Copy current tags
        const stakeholders = [...this.currentEditingStakeholders]; // Copy current stakeholders

        if (startDate && endDate) {
            const start = new Date(`${startDate}T00:00:00`);
            const end = new Date(`${endDate}T00:00:00`);
            if (end < start) {
                const statusEl = document.getElementById('editor-save-status');
                if (statusEl) {
                    statusEl.textContent = 'Data final não pode ser anterior à Data de início.';
                    statusEl.style.color = 'var(--color-error)';
                }
                return;
            }
        }

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
            startDate: startDate || '',
            endDate: endDate || '',
            updates,
            tags,
            stakeholders,
            updatedAt: new Date().toISOString()
        };

        // Substatus editing (only for cards in 'doing')
        if (this.substatusSelect && this.kanbanState[id].status === 'doing') {
            const value = this.substatusSelect.value;
            this.kanbanState[id].substatus = (value === 'doing') ? 'doing' : 'todo';
            const label = this.kanbanState[id].substatus === 'doing' ? 'Fazendo' : 'A fazer';
            this.updateCardSubstatus(id, label);
        }

        // Update the card's tags display in the DOM
        this.updateCardTagsDisplay(id, tags);

        // Update the card's stakeholders badge in the DOM
        this.updateCardStakeholdersBadge(id, stakeholders);

        // Update the card's dates display
        this.updateCardDatesDisplay(id);

        // Show saving feedback in the form
        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) {
            statusEl.textContent = 'Salvando...';
            statusEl.style.color = 'var(--color-text-muted)';
        }

        // Trigger global save
        await this.saveState();

        if (this.currentView === 'timeline') {
            this.renderTimeline();
        }

        // Update feedback
        if (statusEl) {
            statusEl.textContent = 'Salvo com sucesso!';
            statusEl.style.color = 'var(--color-success)';
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        }

        // Refresh tag picker in case new tags were added
        this.refreshTagPicker();

        // Re-apply filters in case tags were modified
        this.applyFilters();
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
            this.applyFilters();
            this.updateClearFiltersVisibility();
        }, 300);
    }

    /**
     * Filter cards based on search query (legacy method, now uses applyFilters)
     * @deprecated Use applyFilters() instead
     */
    filterCards(query) {
        // For backwards compatibility, just apply all filters
        this.applyFilters();
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

    /**
     * Get all unique tags from all cards
     */
    getAllUniqueTags() {
        const tagsSet = new Set();

        for (const cardId in this.kanbanState) {
            if (cardId.startsWith('_')) continue; // Skip metadata like _columnOrder

            const state = this.kanbanState[cardId];
            if (state && typeof state === 'object' && Array.isArray(state.tags)) {
                state.tags.forEach(tag => tagsSet.add(tag));
            }
        }

        return Array.from(tagsSet).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
    }

    /**
     * Toggle the tag picker dropdown
     */
    toggleTagPicker() {
        const isOpen = this.tagPickerDropdown.classList.contains('open');
        if (isOpen) {
            this.closeTagPicker();
        } else {
            this.openTagPicker();
        }
    }

    /**
     * Open the tag picker dropdown
     */
    openTagPicker() {
        this.renderTagPicker();
        this.tagPickerDropdown.classList.add('open');
        this.tagPickerToggle.setAttribute('aria-expanded', 'true');
    }

    /**
     * Close the tag picker dropdown
     */
    closeTagPicker() {
        this.tagPickerDropdown.classList.remove('open');
        this.tagPickerToggle.setAttribute('aria-expanded', 'false');
    }

    /**
     * Render the tag picker dropdown with all available tags
     */
    renderTagPicker() {
        const allTags = this.getAllUniqueTags();

        if (allTags.length === 0) {
            this.tagPickerDropdown.innerHTML = `
                <div class="tag-picker-empty">Nenhuma tag disponível</div>
            `;
            return;
        }

        this.tagPickerDropdown.innerHTML = allTags.map(tag => {
            const isSelected = this.selectedFilterTags.includes(tag);
            return `
                <div class="tag-picker-item ${isSelected ? 'selected' : ''}"
                     data-tag="${this.escapeHtml(tag)}"
                     role="option"
                     aria-selected="${isSelected}">
                    <span class="tag-picker-checkbox"></span>
                    <span class="tag-picker-label">${this.escapeHtml(tag)}</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        this.tagPickerDropdown.querySelectorAll('.tag-picker-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = item.dataset.tag;
                this.handleTagPickerSelect(tag);
            });
        });
    }

    /**
     * Handle selecting/deselecting a tag in the picker
     */
    handleTagPickerSelect(tag) {
        const index = this.selectedFilterTags.indexOf(tag);

        if (index > -1) {
            // Remove tag from filter
            this.selectedFilterTags.splice(index, 1);
        } else {
            // Add tag to filter
            this.selectedFilterTags.push(tag);
        }

        // Re-render picker to update selection state
        this.renderTagPicker();

        // Update chips display
        this.renderSelectedTagsChips();

        // Apply filter
        this.applyFilters();

        // Update clear button visibility
        this.updateClearFiltersVisibility();
    }

    /**
     * Render selected filter tags as chips in the topbar
     */
    renderSelectedTagsChips() {
        if (!this.selectedTagsChips) return;

        if (this.selectedFilterTags.length === 0) {
            this.selectedTagsChips.innerHTML = '';
            return;
        }

        this.selectedTagsChips.innerHTML = this.selectedFilterTags.map(tag => `
            <span class="filter-tag-chip" data-tag="${this.escapeHtml(tag)}">
                ${this.escapeHtml(tag)}
                <button type="button" class="filter-tag-remove" aria-label="Remover tag ${this.escapeHtml(tag)}">×</button>
            </span>
        `).join('');

        // Add click handlers for remove buttons
        this.selectedTagsChips.querySelectorAll('.filter-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const chip = btn.closest('.filter-tag-chip');
                const tag = chip.dataset.tag;
                this.removeFilterTag(tag);
            });
        });
    }

    /**
     * Remove a tag from the filter
     */
    removeFilterTag(tag) {
        const index = this.selectedFilterTags.indexOf(tag);
        if (index > -1) {
            this.selectedFilterTags.splice(index, 1);
            this.renderSelectedTagsChips();
            this.applyFilters();
            this.updateClearFiltersVisibility();

            // Update picker if it's open
            if (this.tagPickerDropdown.classList.contains('open')) {
                this.renderTagPicker();
            }
        }
    }

    /**
     * Clear all filters (search + tags)
     */
    clearAllFilters() {
        // Clear search
        if (this.searchInput) {
            this.searchInput.value = '';
        }

        // Clear selected tags
        this.selectedFilterTags = [];
        this.renderSelectedTagsChips();

        // Update picker if open
        if (this.tagPickerDropdown.classList.contains('open')) {
            this.renderTagPicker();
        }

        // Apply filters (will show all cards)
        this.applyFilters();

        // Hide clear button
        this.updateClearFiltersVisibility();
    }

    /**
     * Update visibility of the clear filters button
     */
    updateClearFiltersVisibility() {
        if (!this.clearFiltersBtn) return;

        const hasSearchQuery = this.searchInput && this.searchInput.value.trim().length > 0;
        const hasSelectedTags = this.selectedFilterTags.length > 0;

        if (hasSearchQuery || hasSelectedTags) {
            this.clearFiltersBtn.style.display = '';
        } else {
            this.clearFiltersBtn.style.display = 'none';
        }
    }

    /**
     * Apply combined filters (search + tags with AND logic)
     */
    applyFilters() {
        const searchQuery = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        const allCards = document.querySelectorAll('.kanban-card');

        allCards.forEach(cardEl => {
            const cardId = cardEl.dataset.id;
            const card = this.interventions.find(c => c.id === cardId);
            if (!card) return;

            // If no filters, show all
            if (!searchQuery && this.selectedFilterTags.length === 0) {
                cardEl.style.display = '';
                return;
            }

            // Check search match (if search query exists)
            let matchesSearch = true;
            if (searchQuery) {
                matchesSearch = this.cardMatchesQuery(card, searchQuery);
            }

            // Check tags match (AND logic - card must have ALL selected tags)
            let matchesTags = true;
            if (this.selectedFilterTags.length > 0) {
                matchesTags = this.cardHasAllTags(cardId, this.selectedFilterTags);
            }

            // Combined filter: search AND tags
            cardEl.style.display = (matchesSearch && matchesTags) ? '' : 'none';
        });

        // Update column counts
        this.updateCounts();

        if (this.currentView === 'timeline') {
            this.renderTimeline();
        }
    }

    getFilteredCards() {
        const searchQuery = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        return this.interventions.filter(card => {
            let matchesSearch = true;
            if (searchQuery) {
                matchesSearch = this.cardMatchesQuery(card, searchQuery);
            }
            let matchesTags = true;
            if (this.selectedFilterTags.length > 0) {
                matchesTags = this.cardHasAllTags(card.id, this.selectedFilterTags);
            }
            return matchesSearch && matchesTags;
        });
    }

    renderTimeline() {
        if (!this.timelineEl) return;

        const cards = this.getFilteredCards();
        const withDates = [];
        const withoutDates = [];

        cards.forEach(card => {
            const state = this.kanbanState[card.id];
            const startDate = state && typeof state === 'object' ? (state.startDate || '') : '';
            const endDate = state && typeof state === 'object' ? (state.endDate || '') : '';

            // Timeline should render even if only one date exists (milestone)
            if (startDate || endDate) {
                const start = startDate || endDate;
                const end = endDate || startDate;
                withDates.push({ card, startDate: start, endDate: end, status: (state && typeof state === 'object' && state.status) ? state.status : 'backlog' });
            } else {
                withoutDates.push({ card, status: (state && typeof state === 'object' && state.status) ? state.status : 'backlog' });
            }
        });

        if (withDates.length === 0) {
            this.timelineEl.innerHTML = `
                <div class="timeline-no-dates">Nenhum card com datas definidas. Defina Data de início e Data final no editor.</div>
                ${withoutDates.length > 0 ? this.renderTimelineNoDatesList(withoutDates) : ''}
            `;
            this.bindTimelineClicks();
            return;
        }

        const starts = withDates.map(x => new Date(`${x.startDate}T00:00:00`));
        const ends = withDates.map(x => new Date(`${x.endDate}T00:00:00`));
        const minStart = new Date(Math.min(...starts.map(d => d.getTime())));
        const maxEnd = new Date(Math.max(...ends.map(d => d.getTime())));

        const rangeDays = Math.max(1, Math.round((maxEnd - minStart) / 86400000) + 1);

        const tickMode = rangeDays > 180 ? 'month' : 'week';
        const ticks = this.buildTimelineTicks(minStart, maxEnd, tickMode);

        const axisHtml = `
            <div class="timeline-header">
                <div class="timeline-axis" style="grid-auto-columns: minmax(90px, 1fr);">
                    ${ticks.map(t => `<div class="timeline-tick">${this.escapeHtml(t.label)}</div>`).join('')}
                </div>
            </div>
        `;

        const rowsHtml = withDates.map(x => {
            const start = new Date(`${x.startDate}T00:00:00`);
            const end = new Date(`${x.endDate}T00:00:00`);
            const left = ((start - minStart) / (rangeDays * 86400000)) * 100;
            const width = (Math.max(1, (end - start) / 86400000 + 1) / rangeDays) * 100;
            const statusClass = `status-${this.escapeHtml(x.status)}`;
            const label = `${x.card.id} — ${x.card.title}`;

            return `
                <div class="timeline-row" data-cardid="${this.escapeHtml(x.card.id)}">
                    <div class="timeline-row-label" data-action="open" data-cardid="${this.escapeHtml(x.card.id)}">${this.escapeHtml(label)}</div>
                    <div class="timeline-row-track">
                        <div class="timeline-bar ${statusClass}" data-action="open" data-cardid="${this.escapeHtml(x.card.id)}" style="left:${left}%; width:${width}%;"></div>
                    </div>
                </div>
            `;
        }).join('');

        this.timelineEl.innerHTML = `
            <div class="timeline-scroll">
                ${axisHtml}
                <div class="timeline-rows">
                    ${rowsHtml}
                </div>
                ${withoutDates.length > 0 ? this.renderTimelineNoDatesList(withoutDates) : ''}
            </div>
        `;

        this.bindTimelineClicks();
    }

    renderTimelineNoDatesList(items) {
        const list = items.map(x => {
            const label = `${x.card.id} — ${x.card.title}`;
            return `<div class="timeline-no-dates" data-action="open" data-cardid="${this.escapeHtml(x.card.id)}">${this.escapeHtml(label)}</div>`;
        }).join('');

        return `
            <div class="timeline-no-dates">
                <strong>Sem datas</strong>
            </div>
            ${list}
        `;
    }

    bindTimelineClicks() {
        if (!this.timelineEl) return;
        this.timelineEl.querySelectorAll('[data-action="open"]').forEach(el => {
            el.addEventListener('click', () => {
                const cardId = el.dataset.cardid;
                if (cardId) this.openEditor(cardId);
            });
        });
    }

    buildTimelineTicks(minStart, maxEnd, mode) {
        const ticks = [];
        const cursor = new Date(minStart.getTime());

        if (mode === 'month') {
            cursor.setDate(1);
            while (cursor <= maxEnd) {
                const label = cursor.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                ticks.push({ date: new Date(cursor.getTime()), label });
                cursor.setMonth(cursor.getMonth() + 1);
            }
            return ticks;
        }

        // week
        while (cursor <= maxEnd) {
            const label = cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            ticks.push({ date: new Date(cursor.getTime()), label });
            cursor.setDate(cursor.getDate() + 7);
        }
        return ticks;
    }

    /**
     * Check if a card has ALL the specified tags (AND logic)
     */
    cardHasAllTags(cardId, requiredTags) {
        const state = this.kanbanState[cardId];
        if (!state || !Array.isArray(state.tags) || state.tags.length === 0) {
            return requiredTags.length === 0;
        }

        const cardTagsLower = state.tags.map(t => t.toLowerCase());

        for (const tag of requiredTags) {
            if (!cardTagsLower.includes(tag.toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Refresh the tag picker dropdown (call after new tags are created)
     */
    refreshTagPicker() {
        if (this.tagPickerDropdown.classList.contains('open')) {
            this.renderTagPicker();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanManager = new KanbanManager();
});
