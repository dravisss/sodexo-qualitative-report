/**
 * Dashboard de Respostas - Versão Premium
 * Com nomes de abas corretos e renderização de tabelas
 */

import { AutoSaveManager } from './autosave.js';

// Tab name mapping (matches app.js)
const TAB_LABELS = {
    'DUE DILIGENCE OPERACIONAL': 'Operacional',
    'RELAÇÕES SINDICAIS': 'Sindical',
    'COMERCIAL': 'Comercial',
    'REMUNERAÇÃO': 'Remuneração',
    'INTERVENÇÕES': 'Intervenções'
};

class RoteiroParser {
    constructor() {
        this.structure = null;
        this.rawMarkdown = null;
    }

    async fetch() {
        const response = await fetch('Refined/roteiro-investigacao-unidades.md');
        this.rawMarkdown = await response.text();
        this.structure = this.parse(this.rawMarkdown);
        return this.structure;
    }

    parse(markdown) {
        const lines = markdown.split('\n');
        const sections = [];
        let currentSection = null;
        let currentSubsection = null;
        let questionCounter = 0;
        let tableCounter = 0;
        let currentTable = null;

        lines.forEach((line, idx) => {
            // H2 = New Section
            if (line.startsWith('## ')) {
                if (currentSection) sections.push(currentSection);
                const rawTitle = line.replace('## ', '').trim();
                // Extract short key for label mapping
                const labelKey = Object.keys(TAB_LABELS).find(k => rawTitle.toUpperCase().includes(k.split(' ')[0]));

                currentSection = {
                    rawTitle,
                    label: labelKey ? TAB_LABELS[labelKey] : rawTitle,
                    subsections: [],
                    questions: [],
                    tables: []
                };
                currentSubsection = null;
                currentTable = null;
            }
            // H3 = Subsection
            else if (line.startsWith('### ')) {
                currentTable = null;
                if (currentSection) {
                    currentSubsection = {
                        title: line.replace('### ', '').trim(),
                        questions: [],
                        tables: []
                    };
                    currentSection.subsections.push(currentSubsection);
                }
            }
            // Table row
            else if (line.trim().startsWith('|')) {
                const cells = line.split('|').filter(c => c.trim());

                // Check if it's header separator (|---|---|)
                if (cells.every(c => c.trim().match(/^-+$/))) {
                    return;
                }

                // New table start
                if (!currentTable || cells.every(c => !['?', '[Anexar]', ''].includes(c.trim()))) {
                    if (currentTable && currentTable.rows.length > 0) {
                        // Save previous table
                        const target = currentSubsection || currentSection;
                        if (target) target.tables.push(currentTable);
                    }
                    currentTable = {
                        index: tableCounter++,
                        headers: cells.map(c => c.trim()),
                        rows: [],
                        fields: []
                    };
                } else {
                    // Data row
                    const row = { cells: [], rowIndex: currentTable.rows.length + 1 };
                    cells.forEach((cell, colIndex) => {
                        const trimmed = cell.trim();
                        const isField = trimmed === '?' || trimmed === '' || trimmed === '[Anexar]';

                        row.cells.push({
                            value: trimmed,
                            isField,
                            isFile: trimmed === '[Anexar]',
                            fieldId: isField ?
                                (trimmed === '[Anexar]'
                                    ? `table_${currentTable.index}_row_${currentTable.rows.length + 1}_col_${colIndex}_file`
                                    : `table_${currentTable.index}_row_${currentTable.rows.length + 1}_col_${colIndex}`)
                                : null
                        });

                        if (isField && !trimmed.includes('[Anexar]')) {
                            currentTable.fields.push({
                                id: `table_${currentTable.index}_row_${currentTable.rows.length + 1}_col_${colIndex}`,
                                row: currentTable.rows.length + 1,
                                col: colIndex
                            });
                        }
                    });
                    currentTable.rows.push(row);
                }
            }
            // Numbered question
            else if (/^\d+\.\s/.test(line)) {
                // Save any pending table
                if (currentTable && currentTable.rows.length > 0) {
                    const target = currentSubsection || currentSection;
                    if (target) target.tables.push(currentTable);
                    currentTable = null;
                }

                const questionText = line.replace(/^\d+\.\s/, '').trim();
                const hasAttachment = questionText.includes('[Anexar]');
                const noField = questionText.includes('[Sem Campo]');

                // Include ALL questions, but mark [Sem Campo] ones
                const question = {
                    id: noField ? null : `question_${questionCounter}`,
                    text: questionText.replace('[Anexar]', '').replace('[Sem Campo]', '').trim(),
                    hasAttachment,
                    noField // Important: marks as reference-only question
                };

                if (currentSubsection) {
                    currentSubsection.questions.push(question);
                } else if (currentSection) {
                    currentSection.questions.push(question);
                }

                if (!noField) questionCounter++;
            }
            // End of table detection
            else if (line.trim() === '' || line.startsWith('**') || line.startsWith('---')) {
                if (currentTable && currentTable.rows.length > 0) {
                    const target = currentSubsection || currentSection;
                    if (target) target.tables.push(currentTable);
                    currentTable = null;
                }
            }
        });

        // Save last section and table
        if (currentTable && currentTable.rows.length > 0) {
            const target = currentSubsection || currentSection;
            if (target) target.tables.push(currentTable);
        }
        if (currentSection) sections.push(currentSection);

        return sections;
    }

    countFields(section) {
        let total = 0;
        section.questions.forEach(q => total++);
        section.tables.forEach(t => total += t.fields.length);
        section.subsections.forEach(sub => {
            sub.questions.forEach(q => total++);
            sub.tables.forEach(t => total += t.fields.length);
        });
        return total;
    }
}

class DashboardManager {
    constructor() {
        this.submissions = [];
        this.parser = new RoteiroParser();
        this.polling = null;
        this.pollingInterval = 10000;
        this.apiBase = '';

        this.init();
    }

    async init() {
        await this.parser.fetch();
        await this.loadSubmissions();
        this.setupEventListeners();
        this.startPolling();
    }

    async loadSubmissions() {
        try {
            const response = await fetch(`${this.apiBase}/api/list-submissions`);
            const data = await response.json();

            if (data.success) {
                this.submissions = data.submissions.map(sub => {
                    let answers = this.parseAnswers(sub.answers);
                    return { ...sub, answers: answers || {} };
                });
                this.render();
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.renderError('Erro ao carregar submissões');
        }
    }

    parseAnswers(answers) {
        if (!answers) return {};

        if (typeof answers === 'object') {
            const keys = Object.keys(answers);
            if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
                try {
                    const chars = [];
                    for (let i = 0; i < keys.length; i++) {
                        if (answers[String(i)] !== undefined) {
                            chars.push(answers[String(i)]);
                        }
                    }
                    const reconstructed = chars.join('');
                    return JSON.parse(reconstructed);
                } catch (e) {
                    const cleaned = {};
                    Object.entries(answers).forEach(([k, v]) => {
                        if (k.startsWith('table_') || k.startsWith('question_')) {
                            cleaned[k] = v;
                        }
                    });
                    return cleaned;
                }
            }
            return answers;
        }

        if (typeof answers === 'string') {
            try {
                return JSON.parse(answers);
            } catch (e) {
                return {};
            }
        }

        return {};
    }

    render() {
        const root = document.getElementById('dashboard-root');

        if (this.submissions.length === 0) {
            root.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma submissão encontrada.</p>
                    <a href="index.html" class="btn-primary">Criar Nova Submissão</a>
                </div>
            `;
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'submissions-grid';

        this.submissions.forEach(submission => {
            const card = this.renderSubmissionCard(submission);
            grid.appendChild(card);
        });

        root.innerHTML = '';
        root.appendChild(grid);
    }

    renderSubmissionCard(submission) {
        const card = document.createElement('div');
        card.className = 'submission-card';
        card.dataset.id = submission.id;

        const analysis = this.analyzeProgress(submission.answers);
        const lastEdit = this.getLastEditTime(submission.last_synced_at);

        card.innerHTML = `
            <div class="submission-header">
                <span class="submission-id">${submission.id.substring(0, 8)}</span>
                <span class="submission-status ${submission.status}">${this.getStatusLabel(submission.status)}</span>
            </div>
            
            <div class="progress-section">
                <h4>📊 Progresso por Seção</h4>
                ${this.renderDetailedProgress(analysis)}
            </div>
            
            <div class="submission-meta">
                <div class="meta-row">
                    <strong>Última Sinc:</strong>
                    <span>${lastEdit}</span>
                </div>
                <div class="meta-row">
                    <strong>Total Respondidas:</strong>
                    <span>${analysis.totalAnswered} de ${analysis.totalQuestions} campos</span>
                </div>
                ${this.renderAttachmentsInfo(submission.attachments || [])}
            </div>
            
            ${this.renderLastEditBadge(submission)}
            
            <div class="submission-actions">
                <button class="btn-primary btn-view" data-id="${submission.id}">👁️ Ver Detalhes</button>
                <button class="btn-secondary btn-export" data-id="${submission.id}">⬇️ Exportar</button>
            </div>
        `;

        return card;
    }

    analyzeProgress(answers = {}) {
        const sections = this.parser.structure;
        const sectionProgress = {};
        let totalQuestions = 0;
        let totalAnswered = 0;

        sections.forEach(section => {
            let sectionTotal = 0;
            let sectionAnswered = 0;

            // Direct questions (skip noField)
            section.questions.forEach(q => {
                if (q.noField) return; // Skip [Sem Campo] questions
                sectionTotal++;
                if (answers[q.id]?.trim()) sectionAnswered++;
            });

            // Table fields
            section.tables.forEach(table => {
                table.fields.forEach(field => {
                    sectionTotal++;
                    if (answers[field.id]?.trim()) sectionAnswered++;
                });
            });

            // Subsections
            section.subsections.forEach(sub => {
                sub.questions.forEach(q => {
                    if (q.noField) return; // Skip [Sem Campo] questions
                    sectionTotal++;
                    if (answers[q.id]?.trim()) sectionAnswered++;
                });
                sub.tables.forEach(table => {
                    table.fields.forEach(field => {
                        sectionTotal++;
                        if (answers[field.id]?.trim()) sectionAnswered++;
                    });
                });
            });

            sectionProgress[section.label] = {
                total: sectionTotal,
                answered: sectionAnswered,
                percent: sectionTotal > 0 ? Math.round((sectionAnswered / sectionTotal) * 100) : 0
            };

            totalQuestions += sectionTotal;
            totalAnswered += sectionAnswered;
        });

        return { sections: sectionProgress, totalQuestions, totalAnswered };
    }

    renderDetailedProgress(analysis) {
        return Object.entries(analysis.sections).map(([label, data]) => {
            if (data.total === 0) {
                return `
                    <div class="progress-item">
                        <div class="progress-header">
                            <span class="progress-label">${label}</span>
                            <span class="no-fields-badge">Sem campos</span>
                        </div>
                    </div>
                `;
            }
            return `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-label">${label}</span>
                        <span class="progress-percent">${data.answered}/${data.total}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${data.percent}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAttachmentsInfo(attachments) {
        if (attachments.length === 0) return '';
        return `
            <div class="meta-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                <strong>📎 Anexos (${attachments.length}):</strong>
                <ul class="attachment-list">
                    ${attachments.slice(0, 3).map(att => `<li class="attachment-item">${att.file_name}</li>`).join('')}
                    ${attachments.length > 3 ? `<li class="attachment-item">... e mais ${attachments.length - 3}</li>` : ''}
                </ul>
            </div>
        `;
    }

    renderLastEditBadge(submission) {
        const now = new Date();
        const lastSync = new Date(submission.last_synced_at);
        const diffMin = Math.floor((now - lastSync) / 60000);

        if (diffMin < 5) {
            return `<div class="last-edit-badge">⚠️ Editado há ${diffMin < 1 ? '<1' : diffMin} min</div>`;
        }
        return '';
    }

    getStatusLabel(status) {
        return status === 'draft' ? '🟡 Rascunho' : '✅ Finalizado';
    }

    getLastEditTime(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    }

    renderError(message) {
        document.getElementById('dashboard-root').innerHTML = `
            <div class="error-state">
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('btn-refresh')?.addEventListener('click', () => this.loadSubmissions());

        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-view')) {
                this.handleView(e.target.closest('.btn-view').dataset.id);
            }
            if (e.target.closest('.btn-export')) {
                this.handleExport(e.target.closest('.btn-export').dataset.id);
            }
        });
    }

    handleView(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;

        const modal = document.getElementById('viewer-modal');
        const viewer = new SubmissionViewer(submission, this.parser);
        viewer.render();

        modal.classList.add('active');
        modal.querySelector('.viewer-close').onclick = () => modal.classList.remove('active');
    }

    handleExport(submissionId) {
        const modal = document.getElementById('export-modal');
        modal.classList.add('active');

        modal.querySelectorAll('.btn-export').forEach(btn => {
            btn.onclick = async () => {
                await ExportHandler.export(submissionId, btn.dataset.format);
                modal.classList.remove('active');
            };
        });

        modal.querySelector('.modal-close').onclick = () => modal.classList.remove('active');
    }

    startPolling() {
        this.polling = setInterval(() => this.loadSubmissions(), this.pollingInterval);
    }

    stopPolling() {
        if (this.polling) clearInterval(this.polling);
    }
}

class SubmissionViewer {
    constructor(submission, parser) {
        this.submission = submission;
        this.parser = parser;
    }

    render() {
        const titleEl = document.getElementById('viewer-title');
        const bodyEl = document.getElementById('viewer-body');

        titleEl.textContent = `📋 Submissão ${this.submission.id.substring(0, 8)}`;

        const answers = this.submission.answers || {};
        const attachments = this.submission.attachments || [];

        let html = '<div class="form-viewer">';

        this.parser.structure.forEach(section => {
            html += `<div class="viewer-section"><h2>${section.label}</h2>`;

            // Section tables
            section.tables.forEach(table => {
                html += this.renderTable(table, answers);
            });

            // Section questions
            section.questions.forEach(q => {
                html += this.renderQuestion(q, answers[q.id] || '');
            });

            // Subsections
            section.subsections.forEach(sub => {
                html += `<h3>${sub.title}</h3>`;

                sub.tables.forEach(table => {
                    html += this.renderTable(table, answers);
                });

                sub.questions.forEach(q => {
                    html += this.renderQuestion(q, answers[q.id] || '');
                });
            });

            html += '</div>';
        });

        // Attachments
        if (attachments.length > 0) {
            html += `
                <div class="viewer-section">
                    <h2>📎 Anexos Enviados</h2>
                    <ul class="attachment-details">
                        ${attachments.map(att => `
                            <li>
                                <strong>${att.file_name}</strong><br>
                                <small>Campo: ${att.field_id} | Tipo: ${att.content_type || 'N/A'}</small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        html += '</div>';
        bodyEl.innerHTML = html;
    }

    renderTable(table, answers) {
        if (!table.headers || !table.rows.length) return '';

        let html = '<table class="viewer-table"><thead><tr>';
        table.headers.forEach(h => {
            html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';

        table.rows.forEach(row => {
            html += '<tr>';
            row.cells.forEach(cell => {
                if (cell.isField && !cell.isFile) {
                    const value = answers[cell.fieldId] || '';
                    const cssClass = value ? 'answered' : 'unanswered';
                    html += `<td class="${cssClass}">${value || '—'}</td>`;
                } else if (cell.isFile) {
                    html += `<td class="unanswered"><em>📎 Arquivo</em></td>`;
                } else {
                    html += `<td>${cell.value}</td>`;
                }
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    renderQuestion(question, answer) {
        // [Sem Campo] questions are reference-only
        if (question.noField) {
            return `
                <div class="question-block reference">
                    <div class="question-header">
                        <span class="status-icon">📋</span>
                        <strong class="question-text">${question.text}</strong>
                    </div>
                    <p class="no-answer"><em>Pergunta de referência (sem campo de resposta)</em></p>
                </div>
            `;
        }

        const status = answer?.trim() ? '✅' : '❌';
        const answerDisplay = answer?.trim()
            ? `<p class="answer">${answer}</p>`
            : '<p class="no-answer">Não respondida</p>';

        return `
            <div class="question-block ${answer?.trim() ? 'answered' : 'unanswered'}">
                <div class="question-header">
                    <span class="status-icon">${status}</span>
                    <strong class="question-text">${question.text}</strong>
                </div>
                ${answerDisplay}
            </div>
        `;
    }
}

class ExportHandler {
    static async export(submissionId, format) {
        try {
            const response = await fetch('/api/export-submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submission_id: submissionId, format })
            });

            const data = await response.json();

            if (data.success) {
                this.download(data.content, data.filename, data.contentType);
            } else {
                alert('Erro ao exportar: ' + data.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Erro ao exportar submissão');
        }
    }

    static download(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize
const dashboard = new DashboardManager();
window.addEventListener('beforeunload', () => dashboard.stopPolling());
