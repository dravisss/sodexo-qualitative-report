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
        this.unitSlug = options.unitSlug || 'general'; // Default unit
        this.syncTimer = null;
        this.isSyncing = false;
        this.isOnline = navigator.onLine;

        // Load existing submission ID from localStorage
        this.loadMeta();

        // Initial sync from cloud if we have an ID
        if (this.submissionId) {
            this.fetchFromCloud();
        }

        // Online/Offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Load metadata (submission ID) from localStorage
     */
    loadMeta() {
        try {
            const meta = JSON.parse(localStorage.getItem(this.metaKey) || '{}');
            this.submissionId = meta.submissionId || null;
            this.unitSlug = meta.unitSlug || this.unitSlug;
        } catch (e) {
            console.warn('Failed to load form meta:', e);
        }
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
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (e) {
            return {};
        }
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

            const payload = {
                submission_id: this.submissionId,
                unit_slug: this.unitSlug,
                answers: answers,
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
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Store the submission ID for future updates
                this.submissionId = result.submission_id;
                this.saveMeta();
                this.updateStatus('Salvo na nuvem', 'saved');
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
     * Upload file attachment to Netlify Blobs
     */
    async uploadFile(fileInput) {
        if (!fileInput.files || fileInput.files.length === 0) return null;

        // First, ensure we have a submission ID
        if (!this.submissionId) {
            await this.syncToCloud();
        }

        if (!this.submissionId) {
            console.error('Cannot upload without submission ID');
            return null;
        }

        const file = fileInput.files[0];
        const fieldId = fileInput.id;

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

            if (result.success) {
                // Store blob key in answers
                this.saveAnswer(`${fieldId}_blob`, result.blob_key);
                this.updateStatus('Arquivo enviado', 'saved');
                return result.blob_key;
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            this.updateStatus('Erro no upload', 'error');
            return null;
        }
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
                        this.updateFileUI(att.field_id, att.file_name);
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

    updateFileUI(fieldId, fileName) {
        const nameDisplay = document.getElementById(`${fieldId}_name`);
        if (nameDisplay) {
            nameDisplay.textContent = `✅ ${fileName}`;
        }
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
    setUnit(slug) {
        this.unitSlug = slug;
        this.saveMeta();
    }
}
