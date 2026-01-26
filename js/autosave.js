/**
 * AutoSaveManager - Handles automatic syncing to Neon Database
 * Features:
 * - Debounced saves (2s after last keystroke)
 * - LocalStorage as hot cache/fallback
 * - File uploads to Netlify Blobs
 * - Status indicator UI
 */
export class AutoSaveManager {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '';
        this.debounceMs = options.debounceMs || 2000;
        this.storageKey = options.storageKey || 'investigation_form_data';
        this.metaKey = options.metaKey || 'investigation_form_meta';

        this.submissionId = null;
        this.unitSlug = 'general'; // Enforce 'general' as the master unit (Unified Form)
        this.syncTimer = null;
        this.isSyncing = false;
        this.isOnline = navigator.onLine;

        // Load existing submission ID from localStorage
        this.loadMeta();

        // Initial sync from cloud
        // Initial sync: ALWAYS fetch latest for master unit (Unified Form Mode)
        // This ensures we sync to the global state regardless of what ID is in local storage or URL
        this.fetchLatestForUnit(this.unitSlug);

        // Online/Offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Upload multiple files for a single field
     */
    async uploadFiles(fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) return [];

        // Ensure we have a submission ID
        if (!this.submissionId) {
            await this.syncToCloud();
        }

        if (!this.submissionId) {
            console.error('Cannot upload without submission ID');
            return [];
        }

        const fieldId = fileInput.id;
        const files = Array.from(fileInput.files);
        const uploaded = [];

        // Start from existing arrays (backward-compatible)
        const answers = this.getAnswers();
        const existingNames = this.normalizeAttachmentArray(answers[fieldId]);
        const existingKeys = this.normalizeAttachmentArray(answers[`${fieldId}_blob`]);

        for (const file of files) {
            this.updateStatus(`Enviando ${file.name}...`, 'saving');
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('submission_id', this.submissionId);
                formData.append('field_id', fieldId);

                const response = await fetch(`${this.apiBase}/api/upload-blob`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Upload failed');
                }

                existingNames.push(file.name);
                existingKeys.push(result.blob_key);
                uploaded.push(result.blob_key);
            } catch (error) {
                console.error('Upload error:', error);
                this.updateStatus('Erro no upload', 'error');
            }
        }

        // Persist arrays (or single value if only one)
        const finalNames = existingNames.length <= 1 ? (existingNames[0] || null) : existingNames;
        const finalKeys = existingKeys.length <= 1 ? (existingKeys[0] || null) : existingKeys;
        this.saveAnswer(fieldId, finalNames);
        this.saveAnswer(`${fieldId}_blob`, finalKeys);

        if (uploaded.length > 0) {
            this.updateStatus('Arquivo enviado', 'saved');
        }

        return uploaded;
    }

    /**
     * Load metadata (submission ID) from localStorage
     */
    loadMeta() {
        try {
            // Unified Mode: Ignore URL ID. We always want the master record.
            // Also ignore local storage ID for the purpose of initial connection (we want latest from server)
            // But we keep local storage loaded just in case we are offline (constructor handles this)

            // If we are online, fetchLatestForUnit will overwrite this.submissionId
            // Restore definition of meta
            const meta = JSON.parse(localStorage.getItem(this.metaKey) || '{}');
            this.submissionId = meta.submissionId || null;

            // Clean URL if it has an ID, to avoid confusion
            const currentUrl = new URL(window.location);
            if (currentUrl.searchParams.has('id')) {
                currentUrl.searchParams.delete('id');
                window.history.replaceState({}, '', currentUrl);
            }

            // FORCE MASTER SLUG
            // FORCE GENERAL SLUG
            this.unitSlug = 'general';
        } catch (e) {
            console.warn('Failed to load form meta:', e);
        }
    }

    recordAttachmentFromCloud(att) {
        if (!att || !att.field_id) return;
        const answers = this.getAnswers();

        const names = this.normalizeAttachmentArray(answers[att.field_id]);
        const keys = this.normalizeAttachmentArray(answers[`${att.field_id}_blob`]);

        if (att.file_name && !names.includes(att.file_name)) {
            names.push(att.file_name);
        }

        if (att.blob_key && !keys.includes(att.blob_key)) {
            keys.push(att.blob_key);
        }

        const finalNames = names.length <= 1 ? (names[0] || null) : names;
        const finalKeys = keys.length <= 1 ? (keys[0] || null) : keys;
        answers[att.field_id] = finalNames;
        answers[`${att.field_id}_blob`] = finalKeys;
        localStorage.setItem(this.storageKey, JSON.stringify(answers));
    }

    /**
     * Save metadata to localStorage
     */
    saveMeta() {
        localStorage.setItem(this.metaKey, JSON.stringify({
            submissionId: this.submissionId,
            unitSlug: this.unitSlug,
            lastSync: new Date().toISOString()
        }));
    }

    /**
     * Get all answers from localStorage
     */
    getAnswers() {
        try {
            const val = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            // Safeguard against double-stringification
            return typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) {
            return {};
        }
    }

    normalizeAttachmentArray(value) {
        if (!value) return [];
        if (Array.isArray(value)) return value.filter(v => v != null && String(v).trim() !== '');
        if (typeof value === 'string') return String(value).trim() ? [value] : [];
        return [];
    }

    /**
     * Save single answer to localStorage and trigger debounced sync
     */
    saveAnswer(fieldId, value) {
        const answers = this.getAnswers();
        answers[fieldId] = value;
        localStorage.setItem(this.storageKey, JSON.stringify(answers));

        this.debouncedSync();
    }

    /**
     * Clear local data and reset submission
     */
    clearData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.metaKey);
        this.submissionId = null;
    }

    /**
     * Update status indicator UI
     */
    updateStatus(status, type = 'info') {
        const statusEl = document.getElementById('form-save-status');
        if (!statusEl) return;

        const icons = {
            saving: '☁️',
            saved: '✅',
            offline: '📴',
            error: '⚠️'
        };

        statusEl.textContent = `${icons[type] || ''} ${status}`;
        statusEl.className = `toolbar-status status-${type}`;
    }

    /**
     * Debounced sync - waits for user to stop typing
     */
    debouncedSync() {
        this.updateStatus('Salvando...', 'saving');

        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => {
            this.syncToCloud();
        }, this.debounceMs);
    }

    /**
     * Main sync function - sends data to Neon via Netlify Function
     */
    async syncToCloud() {
        if (this.isSyncing) return;
        if (!navigator.onLine) {
            this.updateStatus('Offline - salvo local', 'offline');
            return;
        }

        this.isSyncing = true;
        this.updateStatus('Sincronizando...', 'saving');

        try {
            const answers = this.getAnswers();
            const answersMetadata = this.collectFieldMetadata();

            const payload = {
                submission_id: this.submissionId,
                unit_slug: this.unitSlug,
                answers: answers,
                answers_metadata: answersMetadata,
                respondent_info: {
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            };

            const response = await fetch(`${this.apiBase}/api/sync-submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errResult = await response.json();
                    if (errResult.error) errorMsg += `: ${errResult.error}`;
                } catch (e) { /* ignore parse error */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            if (result.success) {
                this.submissionId = result.submission_id;
                this.saveMeta();
                this.updateStatus('Salvo na nuvem', 'saved');

                // Unified Mode: Ensure clean URL (do not expose ID)
                const currentUrl = new URL(window.location);
                if (currentUrl.searchParams.has('id')) {
                    currentUrl.searchParams.delete('id');
                    window.history.replaceState({}, '', currentUrl);
                }
            } else {
                throw new Error(result.error || 'Sync failed');
            }

        } catch (error) {
            console.error('Sync error:', error);
            this.updateStatus('Erro - salvo local', 'error');
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Collect metadata for each field from the DOM
     */
    collectFieldMetadata() {
        const metadata = {};

        // Find all form inputs and extract their context
        document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            const fieldId = input.id;
            if (!fieldId) return;

            // Find section (tab content container)
            const tabContent = input.closest('.tab-content');
            const sectionName = tabContent?.dataset?.tabLabel || 'Geral';

            // Find subsection (h3)
            const subsection = input.closest('div')?.previousElementSibling;
            let subsectionName = null;
            let el = input.parentElement;
            while (el && !subsectionName) {
                const h3 = el.querySelector('h3') || el.previousElementSibling;
                if (h3?.tagName === 'H3') {
                    subsectionName = h3.textContent.trim();
                    break;
                }
                el = el.parentElement;
            }

            // Find question text (parent li or label)
            let questionText = null;
            const li = input.closest('li');
            if (li) {
                // Get text content before the input
                const clone = li.cloneNode(true);
                clone.querySelectorAll('input, textarea, .input-container, .file-upload-wrapper').forEach(e => e.remove());
                questionText = clone.textContent.trim().substring(0, 500);
            }

            // For table cells, build context
            if (fieldId.startsWith('table_')) {
                const table = input.closest('table');
                const row = input.closest('tr');
                const headerRow = table?.querySelector('tr');
                const headers = headerRow ? Array.from(headerRow.querySelectorAll('th, td')).map(th => th.textContent.trim()) : [];
                const firstCell = row?.querySelector('td')?.textContent.trim() || '';
                questionText = `Tabela: ${headers.join(' | ')} | Linha: ${firstCell}`;
            }

            metadata[fieldId] = {
                section: sectionName,
                subsection: subsectionName,
                question_text: questionText,
                field_type: input.tagName === 'TEXTAREA' ? 'textarea' : (fieldId.includes('table_') ? 'table_cell' : 'text')
            };
        });

        return metadata;
    }

    /**
     * Upload file attachment to Netlify Blobs
     */
    async uploadFile(fileInput) {
        const uploaded = await this.uploadFiles(fileInput);
        return uploaded[0] || null;
    }

    /**
     * Fetch latest state from cloud
     */
    async fetchFromCloud() {
        if (!this.submissionId || !navigator.onLine) return;

        this.updateStatus('Carregando nuvem...', 'saving');

        try {
            const response = await fetch(`${this.apiBase}/api/get-submission?id=${this.submissionId}`);
            if (!response.ok) throw new Error('Fetch failed');

            const result = await response.json();
            if (result.success && result.submission) {
                const cloudAnswers = result.submission.answers;

                // Merge cloud answers into local storage (cloud wins for existing keys)
                const localAnswers = this.getAnswers();
                const merged = { ...localAnswers, ...cloudAnswers };

                localStorage.setItem(this.storageKey, JSON.stringify(merged));

                // Trigger a UI update for filenames if any
                if (result.submission.attachments) {
                    result.submission.attachments.forEach(att => {
                        this.recordAttachmentFromCloud(att);
                        this.updateFileUI(att.field_id);
                    });
                }

                this.updateStatus('Sincronizado', 'saved');

                // Dispatch event so app.js knows to update fields
                window.dispatchEvent(new CustomEvent('form-data-loaded', { detail: merged }));
            }
        } catch (e) {
            console.error('Fetch cloud error:', e);
            this.updateStatus('Erro ao carregar nuvem', 'error');
        }
    }

    updateFileUI(fieldId, fileName = null) {
        const nameDisplay = document.getElementById(`${fieldId}_name`);
        if (nameDisplay) {
            // Get blob key from localStorage if available
            const answers = this.getAnswers();

            const names = this.normalizeAttachmentArray(answers[fieldId] || fileName);
            const keys = this.normalizeAttachmentArray(answers[`${fieldId}_blob`]);

            if (names.length === 0) {
                nameDisplay.innerHTML = '';
                return;
            }

            const itemsHtml = names.map((name, idx) => {
                const key = keys[idx];
                const downloadUrl = key ? `/api/download-blob?key=${encodeURIComponent(key)}` : null;
                return `
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="file-success" style="color: var(--color-success);">✅ ${name}</span>
                        ${downloadUrl ? `
                            <a href="${downloadUrl}" target="_blank" class="btn-icon download-file-btn" title="Baixar arquivo" style="color: var(--color-teal); background: none; border: none; cursor: pointer; padding: 0; font-size: 1.1em; text-decoration: none;">
                                ⬇️
                            </a>
                        ` : ''}
                        ${key ? `
                            <button type="button" class="btn-icon remove-file-item-btn" data-field="${fieldId}" data-blob="${key}" title="Remover este arquivo" style="color: var(--color-error); background: none; border: none; cursor: pointer; padding: 0; font-size: 1.1em;">
                                ❌
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('');

            const removeAllHtml = names.length > 1 ? `
                <div>
                    <button type="button" class="btn-icon remove-file-btn" data-field="${fieldId}" title="Remover todos os arquivos" style="color: var(--color-error); background: none; border: none; cursor: pointer; padding: 0; font-size: 1.1em;">
                        ❌
                    </button>
                </div>
            ` : '';

            nameDisplay.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${itemsHtml}
                    ${removeAllHtml}
                </div>
            `;
        }
    }

    /**
     * Remove an answer and its associated blob
     */
    removeAnswer(fieldId) {
        const answers = this.getAnswers();

        // Remove text answer if any (Mark for deletion)
        answers[fieldId] = null;

        // Remove blob reference
        if (answers[`${fieldId}_blob`]) answers[`${fieldId}_blob`] = null;

        // Save updated answers to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(answers));

        this.updateStatus('Arquivo removido', 'saved');

        // Trigger sync to cloud
        this.syncToCloud();
    }

    /**
     * Handle going offline
     */
    handleOffline() {
        this.isOnline = false;
        this.updateStatus('Offline - salvo local', 'offline');
    }

    /**
     * Set the unit slug (called from unit selector UI)
     */
    /**
     * Set the unit slug - DEPRECATED / NO-OP
     * Keeping method signature to prevent crashes if called, but does nothing.
     */
    setUnit(slug) {
        console.log('Unit switching disabled. Using master form.');
    }

    /**
     * Fetch latest submission for a specific unit (Login behavior)
     */
    async fetchLatestForUnit(slug) {
        if (!navigator.onLine) return;

        this.updateStatus('Buscando dados...', 'saving');

        try {
            const response = await fetch(`${this.apiBase}/api/get-submission?unit=${slug}`);
            if (!response.ok) throw new Error('Fetch failed'); // 404 is handled inside

            const result = await response.json();

            // Clear current data first (in case we switch to empty unit)
            let merged = {};
            this.submissionId = null;

            if (result.success && result.submission) {
                this.submissionId = result.submission.id;
                const cloudAnswers = result.submission.answers || {};

                // For unit switch, cloud data overwrites local completely
                // Safeguard: Ensure cloudAnswers is an object matches local expectation
                merged = typeof cloudAnswers === 'string' ? JSON.parse(cloudAnswers) : cloudAnswers;

                // Unified Mode: Ensure clean URL (do not expose ID)
                const currentUrl = new URL(window.location);
                if (currentUrl.searchParams.has('id')) {
                    currentUrl.searchParams.delete('id');
                    window.history.replaceState({}, '', currentUrl);
                }
            } else {
                // No submission found for this unit. Start fresh.
                // Clear URL ID if present
                const currentUrl = new URL(window.location);
                currentUrl.searchParams.delete('id');
                window.history.replaceState({}, '', currentUrl);
            }

            // Update Storage
            localStorage.setItem(this.storageKey, JSON.stringify(merged));
            this.saveMeta();

            // Setup UI for files (if any in result)
            if (result.success && result.submission && result.submission.attachments) {
                // Clear all old file UIs first? No easy way. 
                // But updateFileUI updates specific IDs.
                result.submission.attachments.forEach(att => {
                    this.recordAttachmentFromCloud(att);
                    this.updateFileUI(att.field_id);
                });
            }

            this.updateStatus('Dados carregados', 'saved');

            // Dispatch event to update Form
            window.dispatchEvent(new CustomEvent('form-data-loaded', { detail: merged }));

        } catch (e) {
            console.error('Fetch unit error:', e);
            this.updateStatus('Erro ao buscar unidade', 'error');
        }
    }
}
