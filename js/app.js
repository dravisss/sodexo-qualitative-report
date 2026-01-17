/**
 * Report Reader - Main Application
 * Handles navigation, fetching, and rendering of Markdown articles
 */

import { ARTICLES, REPORT_META } from './config.js';

class ReportReader {
    constructor() {
        this.currentArticle = null;
        this.contentEl = document.getElementById('content');
        this.navListEl = document.getElementById('nav-list');
        this.progressBarEl = document.getElementById('progress-bar');
        this.breadcrumbEl = document.getElementById('breadcrumb-container');
        this.sidebarEl = document.querySelector('.sin-sidebar');
        this.overlayEl = document.getElementById('sidebar-overlay');

        this.init();
    }

    init() {
        this.initializeSidebarState();
        this.renderNavigation();
        this.setupScrollProgress();
        this.handleHashChange();
        this.setupGeneralEvents();

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    /**
     * Render sidebar navigation from ARTICLES config
     */
    renderNavigation() {
        this.navListEl.innerHTML = ARTICLES.map(article => `
      <li class="nav-item">
        <a href="#${article.id}" 
           class="nav-link" 
           data-id="${article.id}"
           title="${article.title}: ${article.subtitle}">
          <span class="nav-number">${article.icon}</span>
          <span class="nav-title">${article.title}</span>
        </a>
      </li>
    `).join('');
    }

    /**
     * Handle URL hash changes for navigation
     */
    handleHashChange() {
        const hash = window.location.hash.slice(1) || '00';
        const article = ARTICLES.find(a => a.id === hash);

        if (article) {
            this.loadArticle(article);
        } else {
            // Default to first article
            this.loadArticle(ARTICLES[0]);
        }
    }

    /**
     * Load and render a Markdown article
     */
    async loadArticle(article) {
        this.currentArticle = article;
        this.updateActiveNav(article.id);
        this.showLoading();

        // Close mobile drawer on navigation
        this.toggleMobileMenu(false);

        try {
            const response = await fetch(article.path);

            if (!response.ok) {
                throw new Error(`Failed to load: ${response.status}`);
            }

            const markdown = await response.text();
            const html = this.parseMarkdown(markdown);
            const fixedHtml = this.fixImagePaths(html, article.path);

            this.contentEl.innerHTML = `<article class="sin-prose">${fixedHtml}</article>`;
            this.contentEl.classList.remove('loading');
            this.renderBreadcrumbs(article);
            this.scrollToTop();

            // Setup interactions based on article type
            if (article.id === '08') {
                this.setupWarRoomModal();
                this.setupMatrixSpotlight();
            } else if (article.id === '05') {
                this.setupCaseFilesTabs();
            } else if (article.id === '15') {
                this.setupInvestigationForm();
            } else {
                this.setupInterventionToggles();
            }

        } catch (error) {
            console.error('Error loading article:', error);
            this.contentEl.classList.remove('loading');
            this.contentEl.innerHTML = `
        <div class="error-message">
          <h2>Erro ao carregar artigo</h2>
          <p>Não foi possível carregar "${article.title}".</p>
          <p><code>${error.message}</code></p>
          <p>Verifique se o servidor local está rodando.</p>
        </div>
      `;
        }
    }

    /**
     * Setup click listeners for intervention cards and sidebar
     */
    setupInterventionToggles() {
        document.querySelectorAll('.intervention-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.closest('.intervention-card');
                card.classList.toggle('collapsed');
            });
        });
    }

    /**
     * Setup tab switching for Article 05 Case Files
     */
    setupCaseFilesTabs() {
        const tabs = document.querySelectorAll('.dossier-tab');
        const panes = document.querySelectorAll('.dossier-pane');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.target;

                // Active Tab state
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Active Pane state
                panes.forEach(p => p.classList.remove('active'));
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    }

    /**
     * Setup general UI event listeners (sidebar, mobile menu)
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

    /**
   * Parse Markdown to HTML using marked.js with custom extensions
   */
    parseMarkdown(markdown) {
        if (typeof marked !== 'undefined') {
            // Add custom extension for GitHub-style alerts: > [!NOTE]
            const alertExtension = {
                name: 'alert',
                level: 'block',
                start(src) { return src.match(/^> \[!/)?.index; },
                tokenizer(src, tokens) {
                    const rule = /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n((?:(?!(?:^> \[!)).*\n?)*)/;
                    const match = rule.exec(src);
                    if (match) {
                        return {
                            type: 'alert',
                            raw: match[0],
                            alertType: match[1].toLowerCase(),
                            text: match[2].replace(/^> /gm, '').trim()
                        };
                    }
                },
                renderer(token) {
                    const icons = {
                        note: '💡',
                        tip: '✨',
                        important: '❗',
                        warning: '⚠️',
                        caution: '🛑'
                    };
                    return `
            <div class="callout ${token.alertType}">
              <div class="callout-title">${icons[token.alertType] || ''} ${token.alertType}</div>
              <div class="callout-content">${marked.parse(token.text)}</div>
            </div>`;
                }
            };

            marked.use({ extensions: [alertExtension] });
            return marked.parse(markdown);
        }
        return `<pre>${markdown}</pre>`;
    }

    /**
   * Post-process HTML to wrap interventions in Line-Art Executive Cards
   */
    renderInterventions(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        const headers = Array.from(div.querySelectorAll('h4'));

        headers.forEach(header => {
            const match = header.textContent.match(/^(I-\d+)\s*[—|-]\s*(.*)$/);
            if (match) {
                const id = match[1];
                const title = match[2];

                const card = document.createElement('div');
                card.className = 'intervention-card collapsed'; // Start collapsed for cleaner view

                const labelsMap = {
                    'Tensão': { icon: '📍', class: 'tensao' },
                    'Descrição': { icon: '📝', class: 'descricao' },
                    'Objetivo': { icon: '🎯', class: 'objetivo' },
                    'Impacto': { icon: '⚡', class: 'impacto' }
                };

                // Capture all text until next major element
                let rawContent = '';
                let next = header.nextElementSibling;
                while (next && !['H1', 'H2', 'H3', 'H4', 'HR'].includes(next.tagName)) {
                    const sibling = next;
                    next = sibling.nextElementSibling;
                    rawContent += sibling.innerHTML + ' ';
                    sibling.remove();
                }

                // Robust regex to find labels
                const fields = [];
                const labels = Object.keys(labelsMap);
                const labelsPattern = labels.join('|');
                const regex = new RegExp(`(?:<[^>]+>|\\*\\*)*(${labelsPattern})[:]?\\s*(?:<\\/[^>]+>|\\*\\*)*\\s*([\\s\\S]*?)(?=(?:<[^>]+>|\\*\\*)*(?:${labelsPattern})[:]?|$)`, 'gi');

                let m;
                while ((m = regex.exec(rawContent)) !== null) {
                    const labelKey = labels.find(l => l.toLowerCase() === m[1].toLowerCase());
                    if (labelKey) {
                        fields.push({
                            label: labelKey,
                            config: labelsMap[labelKey],
                            content: m[2].replace(/<\/?[^>]+(>|$)/g, "").trim()
                        });
                    }
                }

                card.innerHTML = `
          <div class="intervention-header">
            <div class="action-info">
              <span class="action-id">${id}</span>
              <h4 class="action-title">${title}</h4>
            </div>
            <div class="toggle-icon">▼</div>
          </div>
          <div class="intervention-body">
            <div class="intervention-grid">
              ${fields.map(f => `
                <div class="intervention-field field-${f.config.class}">
                  <span class="field-label label-${f.config.class}">${f.config.icon} ${f.label}</span>
                  <div class="field-content">${f.content || '-'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;

                header.parentNode.replaceChild(card, header);
            }
        });

        return div.innerHTML;
    }

    /**
     * Unified processor for all Articles (01-07) to apply consistent card structure
     */
    processArticleContent(html, articleId) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // Config Mapping for all articles
        const config = {
            '01': {
                cardSelector: 'h3',
                idPrefixes: ['2.', '3.', '4.'],
                sectionLabelMap: { '2': 'Mecanismo', '3': 'Nível', '4': 'Dinâmica' },
                iconMap: {
                    'Como funciona': '🔍', 'Consequências observadas': '🚨',
                    'A Interdependência': '🔗', 'O Efeito cascata': '🌊', 'Variações Não Planejadas': '📈', 'O Gatilho Binário': '⚖️', 'Voz da Gestão Local': '🗣️', 'Dilema do Incentivo': '🤔', 'Barreira de Gestão': '🚫', 'Ajuste Funcional': '⚙️',
                    'O Conflito': '⚔️', 'Segurança e Acidentes': '⚠️', 'Auditorias (Regra de Ouro)': '📜'
                }
            },
            '05': {
                cardSelector: 'h3',
                useCaseFiles: true,
                iconMap: {
                    'Cenário': '🏙️', 'Liderança Rotativa': '🔄', 'O Trauma de Gestão': '👻', 'Segregação de Insumos': '🔒',
                    'Infraestrutura no Limite': '🏚️', 'Acúmulo de Funções': '🏋️', 'Liderança Estável, mas Impotente': '🛑',
                    'Adoecimento da "Velha Guarda"': '👴', 'Falha Sistêmica de Equipamentos': '⚙️', 'Explosão de Volume sem Aviso': '💥',
                    'Falta de Especialização': '🔪', 'A Armadilha da Assiduidade': '🎣', 'Dimensionamento Crítico': '📉',
                    'A Controvérsia da Insalubridade': '☣️', 'Privação de Recursos Básicos': '👕', 'Liderança Local': '🗣️'
                }
            },
            '02': {
                cardSelector: 'h3',
                idPrefixes: ['2.', '3.', '4.'],
                sectionLabelMap: { '2': 'Cadeia', '3': 'Perfil', '4': 'Dinâmica' },
                iconMap: {
                    'Etapa 1': '1️⃣', 'Etapa 2': '2️⃣', 'Etapa 3': '3️⃣', 'Etapa 4': '4️⃣', 'Etapa 5': '5️⃣', 'Este ciclo': '🔄',
                    'A Interdependência': '🔗', 'O Efeito cascata': '🌊', 'Variações Não Planejadas': '📈', 'O Gatilho Binário': '⚖️', 'Voz da Gestão Local': '🗣️', 'Dilema do Incentivo': '🤔', 'Barreira de Gestão': '🚫', 'Ajuste Funcional': '⚙️', 'Instabilidade': '⚠️', 'Percepção': '📉', 'Gestão': '🚨', 'Sobrecarga': '🧗', 'Pressão': '💣', 'Isolamento': '🏚️', 'Medicação': '💊', 'Dificuldade': '🛑', 'Cultura': '🧪',
                    'O Mecanismo': '⚙️', 'As Consequências': '🚨', 'O Cálculo Oculto': '🧮'
                }
            },
            '03': {
                cardSelector: 'h2, h3',
                idPrefixes: ['1.', '2.', '3.'],
                sectionLabelMap: { '1': 'Mecanismo', '2': 'Perspectiva', '3': 'Ciclo', 'Fase': 'Etapa' },
                iconMap: {
                    'Resultado': '📊', 'Nota': '💡',
                    'Fase 1': '💬', 'Fase 2': '🎢', 'Fase 3': '☣️', 'Fase 4': '🔄',
                    'Dimensão': '📐', 'Impacto Observado': '💥', 'Estimativa de custo': '💰'
                }
            },
            '04': {
                cardSelector: 'h2, h3',
                idPrefixes: ['3.', '4.', '5.'],
                sectionLabelMap: { '3': 'Crise', '4': 'Pressão', '5': 'Competição' },
                iconMap: {
                    'O Que Mudou': '🔄', 'Consequência': '🚨', 'O Incentivo Estrutural': '⚖️', 'O Corte do "Invisível"': '✂️'
                }
            },
            '07': {
                cardSelector: 'h3',
                idPrefixes: ['🔴', '🟠', '🟡'],
                sectionLabelMap: { '🔴': 'Crítico', '🟠': 'Alto', '🟡': 'Médio' },
                iconMap: { 'O que é': '❓', 'Exposição estimada': '💰', 'Multicausalidade': '🧬' }
            },
            '09': {
                cardSelector: 'h2',
                useTimeline: true,
                iconMap: {
                    'Marco': '📑', 'A Descoberta': '🔍', 'O Consenso': '🤝', 'Ação': '⚡', 'O Achado': '🕵️',
                    'Impacto': '💥', 'O Esforço': '💪', 'O Resultado': '📊', 'O Aprendizado': '💡',
                    'A Descoberta Chave': '🔑', 'A Conclusão': '🏁', 'Hipótese': '🧪'
                }
            },
            '10': {
                cardSelector: 'h3',
                useLabArchive: true,
                iconMap: {
                    'A Ideia': '💡', 'Hipótese': '🧪', 'Barreira Encontrada': '🛑',
                    'Barreira/Status': '⚠️', 'Aprendizado': '🧠', 'O Sintoma': '🩺'
                }
            }
        };

        const artConfig = config[articleId];
        if (!artConfig) return div.innerHTML;

        // Process cards
        const headers = Array.from(div.querySelectorAll(artConfig.cardSelector));
        headers.forEach(header => {
            const text = header.textContent.trim();
            let match = null;

            // Try to find a match in idPrefixes
            if (artConfig.idPrefixes) {
                for (const prefix of artConfig.idPrefixes) {
                    if (text.startsWith(prefix)) {
                        match = { prefix: prefix.replace('.', ''), label: text.replace(prefix, '').trim() };
                        break;
                    }
                }
            }

            if (match) {
                const card = document.createElement('div');
                card.className = 'intervention-card collapsed';

                const sectionLabel = artConfig.sectionLabelMap[match.prefix] || artConfig.sectionLabelMap[match.prefix.charAt(0)] || 'Analise';

                const fields = [];
                let currentField = null;
                let next = header.nextElementSibling;

                while (next && !['H1', 'H2', 'H3', 'HR'].includes(next.tagName)) {
                    const sibling = next;
                    next = sibling.nextElementSibling;

                    const strong = sibling.querySelector('strong');
                    const isNewField = strong && (sibling.tagName === 'P' || sibling.tagName === 'LI') &&
                        (sibling.textContent.trim().startsWith(strong.textContent.trim()));

                    if (isNewField) {
                        const labelText = strong.textContent.replace(/[:]$|$/, '').trim();
                        currentField = {
                            label: labelText,
                            icon: artConfig.iconMap[labelText] || '•',
                            content: sibling.innerHTML.replace(strong.outerHTML, '').replace(/^\s*[:]?\s*/, '').trim()
                        };
                        if (currentField.content) currentField.content = `<p>${currentField.content}</p>`;
                        fields.push(currentField);
                    } else if (currentField) {
                        currentField.content += sibling.outerHTML;
                    } else {
                        fields.push({ label: 'Detalhes', icon: '📝', content: sibling.outerHTML });
                        currentField = fields[fields.length - 1];
                    }
                    sibling.remove();
                }

                card.innerHTML = `
                  <div class="intervention-header">
                    <div class="action-info">
                      <span class="action-id">${sectionLabel} ${match.prefix.includes('.') ? match.prefix : ''}</span>
                      <h4 class="action-title">${match.label}</h4>
                    </div>
                    <div class="toggle-icon">▼</div>
                  </div>
                  <div class="intervention-body">
                    <div class="intervention-stack">
                      ${fields.map(f => `
                        <div class="intervention-field">
                          <span class="field-label">${f.icon} ${f.label}</span>
                          <div class="field-content">${f.content}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
                header.parentNode.replaceChild(card, header);
            }
        });

        // Special Timeline Processing for Article 09
        if (artConfig.useTimeline) {
            return this.renderTimeline(div, artConfig);
        }

        // Special Lab Archive Processing for Article 10
        if (artConfig.useLabArchive) {
            return this.renderLabArchive(div, artConfig);
        }

        // Special Case Files Processing for Article 05
        if (artConfig.useCaseFiles) {
            return this.renderCaseFiles(div, artConfig);
        }

        // Add callout for Synthesis (H2 with "Síntese")
        const synthesisHeader = Array.from(div.querySelectorAll('h2')).find(h =>
            h.textContent.toLowerCase().includes('síntese') ||
            h.textContent.toLowerCase().includes('considerações finais')
        );

        if (synthesisHeader) {
            const box = document.createElement('div');
            box.className = 'callout important';
            let contentHtml = '';
            let next = synthesisHeader.nextElementSibling;
            while (next && !['H1', 'H2', 'H3', 'HR'].includes(next.tagName)) {
                const sibling = next;
                next = sibling.nextElementSibling;
                contentHtml += sibling.outerHTML;
                sibling.remove();
            }
            box.innerHTML = `
                <div class="callout-title">🎯 Síntese Estratégica</div>
                <div class="callout-content">${contentHtml}</div>
            `;
            synthesisHeader.parentNode.insertBefore(box, synthesisHeader.nextSibling);
        }

        return div.innerHTML;
    }

    /**
     * Render Investigation Form (Article 15)
     * Converts '?' in tables to inputs and adds textareas for questions
     */
    /**
     * Render Investigation Form (Article 15)
     * Refactored to use TABS based on H2 headers
     */
    renderInvestigationForm(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // 1. Setup Data Processing (Inputs)
        // Process Tables
        div.querySelectorAll('table').forEach((table, tIndex) => {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row, rIndex) => {
                if (rIndex === 0) return;
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, cIndex) => {
                    const cleanText = cell.textContent.trim();
                    if (cleanText === '?' || cleanText === '') {
                        const fieldId = `table_${tIndex}_row_${rIndex}_col_${cIndex}`;
                        cell.innerHTML = `
                            <input type="text" 
                                   class="form-input" 
                                   id="${fieldId}" 
                                   data-type="table-cell"
                                   placeholder="Inserir dado..." />
                        `;
                    } else if (cleanText === '[Anexar]') {
                        const fieldId = `table_${tIndex}_row_${rIndex}_col_${cIndex}_file`;
                        cell.innerHTML = `
                            <div class="file-upload-wrapper">
                                <label for="${fieldId}" class="custom-file-upload">
                                    <span class="icon">📎</span> Anexar
                                </label>
                                <input type="file" class="form-attachment" id="${fieldId}" data-context="Table ${tIndex} Row ${rIndex}" hidden onchange="document.getElementById('${fieldId}_name').textContent = this.files.length > 0 ? this.files[0].name : ''" />
                                <div id="${fieldId}_name" class="file-name-display"></div>
                            </div>
                         `;
                    }
                });
            });
        });

        // Process Questions
        // Process Questions
        div.querySelectorAll('li').forEach((li, index) => {
            // Check for tags and clean text
            const textContent = li.textContent;
            const hasAttachment = textContent.includes('[Anexar]');
            const noField = textContent.includes('[Sem Campo]');

            // Helper to safely remove tag from direct text nodes or formatting elements, WITHOUT destroying children ULs
            const cleanTagSafe = (element, tag) => {
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes(tag)) {
                        node.textContent = node.textContent.replace(tag, '');
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'UL' && node.tagName !== 'OL') {
                        // Recurse into formatting tags (strong, em, etc) but skip lists
                        cleanTagSafe(node, tag);
                    }
                });
            };

            if (hasAttachment) cleanTagSafe(li, '[Anexar]');
            if (noField) cleanTagSafe(li, '[Sem Campo]');

            const fieldId = `question_${index}`;
            const inputContainer = document.createElement('div');
            inputContainer.className = 'answer-container';

            // Only render textarea if NOT marked as [Sem Campo]
            if (!noField) {
                inputContainer.innerHTML = `
                    <textarea class="form-textarea" 
                              id="${fieldId}" 
                              data-type="question-answer"
                              rows="3" 
                              placeholder="Sua resposta..."></textarea>
                `;
            }

            // Add file upload button if needed
            if (hasAttachment) {
                const fileId = `question_${index}_file`;
                const fileUploadHtml = `
                    <div class="file-upload-wrapper" style="margin-top: 8px;">
                        <label for="${fileId}" class="custom-file-upload">
                            <span class="icon">📎</span> Anexar Evidência
                        </label>
                        <input type="file" class="form-attachment" id="${fileId}" data-context="Question ${index}" hidden onchange="document.getElementById('${fileId}_name').textContent = this.files.length > 0 ? this.files[0].name : ''" />
                        <div id="${fileId}_name" class="file-name-display"></div>
                    </div>
                `;
                inputContainer.insertAdjacentHTML('beforeend', fileUploadHtml);
            }

            // Append container LAST, ensuring it persists
            if (inputContainer.hasChildNodes()) {
                // If the LI has children (like a nested UL), insert BEFORE the nested list
                const nestedList = li.querySelector('ul, ol');
                if (nestedList) {
                    li.insertBefore(inputContainer, nestedList);
                } else {
                    li.appendChild(inputContainer);
                }
            }
        });

        // 2. Build Tab Structure
        const sections = [];
        const h2s = div.querySelectorAll('h2');
        let currentSection = null;

        // Map long titles to short tab labels
        const labelMap = {
            'DUE DILIGENCE': 'Operacional',
            'RELAÇÕES SINDICAIS': 'Sindical',
            'COMERCIAL': 'Comercial',
            'REMUNERAÇÃO': 'Remuneração',
            'INTERVENÇÕES': 'Intervenções',
            'REVISÃO': 'Revisão',
            'RISCOS': 'Riscos'
        };

        // Extract content into sections
        // Strategy: Iterate through children. When H2 is found, start new section.
        // Everything before first H2 is "Intro".

        // We need to re-traverse div.childNodes to group them
        const newContainer = document.createElement('div');

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'form-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-content">
                <span class="toolbar-status" id="form-save-status">Autosalvo</span>
                <div class="toolbar-actions">
                    <button class="btn-primary" id="btn-submit-netlify">💾 Salvar</button>
                    <button class="btn-danger" id="btn-clear-data">🗑️ Limpar</button>
                </div>
            </div>
            <div class="form-tabs" id="form-tabs">
                <!-- Javascript populates this -->
            </div>
        `;
        newContainer.appendChild(toolbar);

        // Content Wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'form-content-wrapper';
        newContainer.appendChild(contentWrapper);

        // Parsing logic
        let currentWrapper = document.createElement('div');
        currentWrapper.className = 'tab-pane active'; // Start with Intro active
        currentWrapper.id = 'pane-intro';
        contentWrapper.appendChild(currentWrapper);

        const tabData = [{ id: 'pane-intro', label: 'Introdução' }];

        // Nested Tabs state
        let nestedTabsContainer = null;
        let nestedTabsBar = null;
        let nestedTabsContent = null;
        let currentNestedPane = null;
        let nestedTabData = [];
        let isFirstH3InSection = true;

        Array.from(div.children).forEach(child => {
            if (child.tagName === 'H2') {
                // Close any open nested tabs structure
                if (nestedTabsContainer && nestedTabData.length > 0) {
                    // Render nested tab buttons
                    nestedTabData.forEach((nt, idx) => {
                        const btn = document.createElement('button');
                        btn.className = `nested-tab ${idx === 0 ? 'active' : ''}`;
                        btn.dataset.target = nt.id;
                        btn.textContent = nt.label;
                        nestedTabsBar.appendChild(btn);
                    });
                    currentWrapper.appendChild(nestedTabsContainer);
                }
                nestedTabsContainer = null;
                nestedTabsBar = null;
                nestedTabsContent = null;
                currentNestedPane = null;
                nestedTabData = [];
                isFirstH3InSection = true;

                // New Section
                const title = child.textContent;
                const key = Object.keys(labelMap).find(k => title.toUpperCase().includes(k));
                const label = key ? labelMap[key] : title.substring(0, 15);
                const id = 'pane-' + this.slugify(label);

                currentWrapper = document.createElement('div');
                currentWrapper.className = 'tab-pane';
                currentWrapper.id = id;
                contentWrapper.appendChild(currentWrapper);
                tabData.push({ id: id, label: label });

            } else if (child.tagName === 'H3') {
                const h3Text = child.textContent.trim();

                // First H3 is usually "Contexto" - render it as intro text, not a tab
                if (isFirstH3InSection && h3Text.toLowerCase().includes('contexto')) {
                    isFirstH3InSection = false;
                    // Just append the H3 as-is (intro heading)
                    currentWrapper.appendChild(child);
                } else {
                    // This is a sub-tab category
                    if (!nestedTabsContainer) {
                        // Initialize nested tabs structure
                        nestedTabsContainer = document.createElement('div');
                        nestedTabsContainer.className = 'nested-tabs-container';

                        nestedTabsBar = document.createElement('div');
                        nestedTabsBar.className = 'nested-tabs-bar';
                        nestedTabsContainer.appendChild(nestedTabsBar);

                        nestedTabsContent = document.createElement('div');
                        nestedTabsContent.className = 'nested-tabs-content';
                        nestedTabsContainer.appendChild(nestedTabsContent);
                    }

                    // Create new nested pane
                    const nestedId = 'nested-' + this.slugify(h3Text);
                    currentNestedPane = document.createElement('div');
                    currentNestedPane.className = `nested-pane ${nestedTabData.length === 0 ? 'active' : ''}`;
                    currentNestedPane.id = nestedId;
                    nestedTabsContent.appendChild(currentNestedPane);

                    nestedTabData.push({ id: nestedId, label: h3Text.replace('Perguntas sobre ', '').replace('Perguntas ', '') });
                    isFirstH3InSection = false;
                }
            } else {
                // Append content to the appropriate container
                if (currentNestedPane) {
                    currentNestedPane.appendChild(child);
                } else {
                    currentWrapper.appendChild(child);
                }
            }
        });

        // Close final nested tabs if any
        if (nestedTabsContainer && nestedTabData.length > 0) {
            nestedTabData.forEach((nt, idx) => {
                const btn = document.createElement('button');
                btn.className = `nested-tab ${idx === 0 ? 'active' : ''}`;
                btn.dataset.target = nt.id;
                btn.textContent = nt.label;
                nestedTabsBar.appendChild(btn);
            });
            currentWrapper.appendChild(nestedTabsContainer);
        }

        // 3. Render Tabs Buttons
        const tabsContainer = toolbar.querySelector('#form-tabs');
        tabData.forEach((tab, index) => {
            const btn = document.createElement('button');
            btn.className = `form-tab ${index === 0 ? 'active' : ''}`;
            btn.dataset.target = tab.id;
            btn.textContent = tab.label;
            tabsContainer.appendChild(btn);
        });

        return newContainer.innerHTML;
    }

    /**
     * Setup event listeners for the Investigation Form
     */
    setupInvestigationForm() {
        this.loadFormAnswers();

        // Autosave listeners
        const inputs = this.contentEl.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.saveFormAnswer(e.target.id, e.target.value);
                this.updateSaveStatus('Salvando...');
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    this.updateSaveStatus('Salvo');
                }, 1000);
            });
        });

        // Tab Switching Logic
        const tabs = this.contentEl.querySelectorAll('.form-tab');
        const panes = this.contentEl.querySelectorAll('.tab-pane');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Active Tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Active Pane
                const targetId = tab.dataset.target;
                panes.forEach(p => {
                    p.classList.remove('active');
                    if (p.id === targetId) p.classList.add('active');
                });

                // Scroll to top of content (below toolbar)
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Nested Tab Switching Logic (Fichário)
        const nestedTabs = this.contentEl.querySelectorAll('.nested-tab');
        nestedTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const container = tab.closest('.nested-tabs-container');
                if (!container) return;

                // Active nested tab button
                container.querySelectorAll('.nested-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Active nested pane
                const targetId = tab.dataset.target;
                container.querySelectorAll('.nested-pane').forEach(p => {
                    p.classList.remove('active');
                    if (p.id === targetId) p.classList.add('active');
                });
            });
        });

        // Button listeners
        const btnSubmit = this.contentEl.querySelector('#btn-submit-netlify');
        const btnClear = this.contentEl.querySelector('#btn-clear-data');

        if (btnSubmit) btnSubmit.addEventListener('click', () => this.submitToNetlify());

        if (btnClear) btnClear.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja apagar todas as respostas e começar do zero?')) {
                localStorage.removeItem('investigation_form_data');
                location.reload();
            }
        });
    }

    updateSaveStatus(msg) {
        document.querySelectorAll('#form-save-status').forEach(el => el.textContent = msg);
    }

    /**
     * Load answers from localStorage
     */
    loadFormAnswers() {
        const data = JSON.parse(localStorage.getItem('investigation_form_data') || '{}');
        Object.entries(data).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value;
        });
    }

    /**
     * Save single answer to localStorage
     */
    saveFormAnswer(id, value) {
        const data = JSON.parse(localStorage.getItem('investigation_form_data') || '{}');
        data[id] = value;
        localStorage.setItem('investigation_form_data', JSON.stringify(data));
    }



    /**
     * Submit data to Netlify Forms
     */
    async submitToNetlify() {
        const btn = this.contentEl.querySelector('#btn-submit-netlify');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Enviando...';
        this.updateSaveStatus('Enviando...');

        try {
            const data = JSON.parse(localStorage.getItem('investigation_form_data') || '{}');
            const contextInfo = `Data: ${new Date().toLocaleString()} | UserAgent: ${navigator.userAgent}`;

            // Prepare FormData for Netlify
            const formData = new FormData();
            formData.append('form-name', 'investigation-data');
            formData.append('context_info', contextInfo);

            // Handle Attachments
            const fileInputs = this.contentEl.querySelectorAll('.form-attachment');
            const attachmentMap = {};
            let fileCount = 0;

            fileInputs.forEach((input) => {
                if (input.files.length > 0 && fileCount < 10) {
                    const file = input.files[0];
                    const fieldName = `attachment_${fileCount}`;

                    // Append file to FormData
                    formData.append(fieldName, file);

                    // Record metadata
                    attachmentMap[fieldName] = {
                        originalName: file.name,
                        fieldId: input.id,
                        context: input.dataset.context || 'Unknown'
                    };

                    fileCount++;
                }
            });

            // Add attachments map to payload
            data._attachments_map = attachmentMap;

            // Add main payload
            formData.append('payload', JSON.stringify(data, null, 2));

            // Send via Fetch (Content-Type is set automatically for FormData)
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('✅ Dados e arquivos enviados com sucesso para a nuvem!');
                this.updateSaveStatus('Enviado para Nuvem');
            } else {
                throw new Error('Erro na resposta do servidor');
            }

        } catch (error) {
            console.error('Netlify Submit Error:', error);
            alert('❌ Erro ao enviar dados. Verifique sua conexão.');
            this.updateSaveStatus('Erro no envio');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    /**
     * Render War Room Dashboard (Article 08)
     * Transforms intervention plan into a Kanban-style board
     */
    renderWarRoom(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // Extract title from H1
        const h1 = div.querySelector('h1');
        const title = h1 ? h1.textContent : 'Plano de Intervenção';
        if (h1) h1.remove();


        // Phase configuration
        const phases = [
            { num: 1, name: 'TORNIQUETE', subtitle: 'Imediato', class: 'phase-1' },
            { num: 2, name: 'DESCOMPRESSÃO', subtitle: 'Curto Prazo', class: 'phase-2' },
            { num: 3, name: 'REESTRUTURAÇÃO', subtitle: 'Médio Prazo', class: 'phase-3' },
            { num: 4, name: 'REPOSICIONAMENTO', subtitle: 'Longo Prazo', class: 'phase-4' }
        ];

        // Parse interventions by phase
        const phaseData = phases.map(p => ({ ...p, interventions: [] }));
        let currentPhase = null;

        // Find all H2s (phases) and H4s (interventions)
        const h2s = Array.from(div.querySelectorAll('h2'));
        h2s.forEach(h2 => {
            const phaseMatch = h2.textContent.match(/(?:FASE|FRENTE)\s*(\d)/i);
            if (phaseMatch) {
                currentPhase = parseInt(phaseMatch[1]) - 1;
            }
        });

        // Now parse H4s for interventions
        const h4s = Array.from(div.querySelectorAll('h4'));
        const interventionMap = {}; // Store titles for matrix tooltips

        h4s.forEach(h4 => {
            const match = h4.textContent.match(/^(I-\d+)\s*[—|-]\s*(.*)$/);
            if (match) {
                interventionMap[match[1]] = match[2]; // Save title to map

                // Find which phase this belongs to by looking at previous H2
                let phaseIndex = 0;
                let el = h4.previousElementSibling;
                while (el) {
                    if (el.tagName === 'H2') {
                        const pm = el.textContent.match(/(?:FASE|FRENTE)\s*(\d)/i);
                        if (pm) {
                            phaseIndex = parseInt(pm[1]) - 1;
                            break;
                        }
                    }
                    el = el.previousElementSibling;
                }

                // Extract fields - collect all text then parse with regex
                const fields = { tensao: '', descricao: '', objetivo: '', impacto: '' };
                let next = h4.nextElementSibling;
                let fullText = '';

                while (next && !['H1', 'H2', 'H3', 'H4', 'HR'].includes(next.tagName)) {
                    fullText += ' ' + (next.textContent || '');
                    next = next.nextElementSibling;
                }

                // Use regex to extract each field
                // Pattern: Label: content (until next label or end)
                const tensaoMatch = fullText.match(/Tensão:\s*([\s\S]*?)(?=Descrição:|$)/i);
                const descricaoMatch = fullText.match(/Descrição:\s*([\s\S]*?)(?=Objetivo:|$)/i);
                const objetivoMatch = fullText.match(/Objetivo:\s*([\s\S]*?)(?=Impacto:|$)/i);
                const impactoMatch = fullText.match(/Impacto:\s*([\s\S]*?)$/i);

                if (tensaoMatch) fields.tensao = tensaoMatch[1].trim();
                if (descricaoMatch) fields.descricao = descricaoMatch[1].trim();
                if (objetivoMatch) fields.objetivo = objetivoMatch[1].trim();
                if (impactoMatch) fields.impacto = impactoMatch[1].trim();

                if (phaseData[phaseIndex]) {
                    phaseData[phaseIndex].interventions.push({
                        id: match[1],
                        title: match[2],
                        ...fields
                    });
                }
            }
        });

        // Extract intro content (everything before the first H2)
        // Note: H1 was removed at the start of the function, so we start at the top
        let introHtml = '';
        let nextEl = div.firstElementChild;

        while (nextEl && nextEl.tagName !== 'H2') {
            introHtml += nextEl.outerHTML;
            nextEl = nextEl.nextElementSibling;
        }

        // Extract summary table (last table in document)
        let summaryHtml = '';
        const tables = Array.from(div.querySelectorAll('table'));
        if (tables.length > 0) {
            const lastTable = tables[tables.length - 1];
            // Check if it's the priority table (contains "Priorização")
            const prevH2 = lastTable.previousElementSibling;
            if (prevH2 && prevH2.textContent.includes('Resumo')) {
                summaryHtml = `<h2>${prevH2.textContent}</h2>${lastTable.outerHTML}`;
            } else {
                summaryHtml = lastTable.outerHTML;
            }
        }

        // Build the board HTML with tooltips
        const phaseTooltips = {
            1: 'Ações imediatas para estancar hemorragia operacional e restaurar dignidade básica.',
            2: 'Intervenções de curto prazo para aliviar pressão e melhorar o clima.',
            3: 'Mudanças estruturais de médio prazo nas regras e processos.',
            4: 'Transformações de longo prazo para reposicionamento estratégico.'
        };

        // Generate tag from tensão (first 2-3 significant words)
        const generateTag = (tensao) => {
            if (!tensao) return '';
            const words = tensao.split(/\s+/).slice(0, 3).join(' ');
            return words.length > 25 ? words.substring(0, 22) + '...' : words;
        };

        // Matrix Classification Data
        const MATRIX_DATA = {
            quickWins: {
                label: 'Quick Wins',
                emoji: '💎',
                desc: 'Alto Impacto / Baixo Esforço',
                ids: ['I-01', 'I-02', 'I-06', 'I-08', 'I-11', 'I-22', 'I-23', 'I-26', 'I-29', 'I-30', 'I-37']
            },
            transformational: {
                label: 'Transformacionais',
                emoji: '🚀',
                desc: 'Alto Impacto / Alto Esforço',
                ids: ['I-03', 'I-14', 'I-15', 'I-16', 'I-17', 'I-18', 'I-21', 'I-24', 'I-25', 'I-27', 'I-32', 'I-34', 'I-35']
            },
            tactical: {
                label: 'Táticas',
                emoji: '🔧',
                desc: 'Baixo Impacto / Baixo Esforço',
                ids: ['I-05', 'I-07', 'I-10', 'I-12', 'I-13', 'I-19', 'I-20', 'I-31', 'I-33']
            },
            complex: {
                label: 'Ingratas',
                emoji: '⚠️',
                desc: 'Baixo Impacto / Alto Esforço',
                ids: ['I-04', 'I-09', 'I-36']
            }
        };

        // Build Matrix HTML
        const matrixHtml = `
            <div class="strategy-matrix">
                <div class="matrix-header">
                    <h2>Matriz de Priorização</h2>
                    <p class="matrix-subtitle">Passe o mouse sobre uma intervenção para localizá-la no plano abaixo</p>
                </div>
                <div class="matrix-grid">
                    <div class="matrix-axis-y">
                        <span class="axis-label-high">Alto<br>Impacto</span>
                        <span class="axis-label-low">Baixo<br>Impacto</span>
                    </div>
                    <div class="matrix-quadrants">
                        <div class="matrix-quadrant q1">
                            <div class="quadrant-header">
                                <span class="quadrant-emoji">${MATRIX_DATA.quickWins.emoji}</span>
                                <span class="quadrant-label">${MATRIX_DATA.quickWins.label}</span>
                            </div>
                            <div class="quadrant-chips">
                                ${MATRIX_DATA.quickWins.ids.map(id => `<span class="matrix-chip" data-id="${id}" title="${id}: ${interventionMap[id] || ''}">${id}</span>`).join('')}
                            </div>
                        </div>
                        <div class="matrix-quadrant q2">
                            <div class="quadrant-header">
                                <span class="quadrant-emoji">${MATRIX_DATA.transformational.emoji}</span>
                                <span class="quadrant-label">${MATRIX_DATA.transformational.label}</span>
                            </div>
                            <div class="quadrant-chips">
                                ${MATRIX_DATA.transformational.ids.map(id => `<span class="matrix-chip" data-id="${id}" title="${id}: ${interventionMap[id] || ''}">${id}</span>`).join('')}
                            </div>
                        </div>
                        <div class="matrix-quadrant q3">
                            <div class="quadrant-header">
                                <span class="quadrant-emoji">${MATRIX_DATA.tactical.emoji}</span>
                                <span class="quadrant-label">${MATRIX_DATA.tactical.label}</span>
                            </div>
                            <div class="quadrant-chips">
                                ${MATRIX_DATA.tactical.ids.map(id => `<span class="matrix-chip" data-id="${id}" title="${id}: ${interventionMap[id] || ''}">${id}</span>`).join('')}
                            </div>
                        </div>
                        <div class="matrix-quadrant q4">
                            <div class="quadrant-header">
                                <span class="quadrant-emoji">${MATRIX_DATA.complex.emoji}</span>
                                <span class="quadrant-label">${MATRIX_DATA.complex.label}</span>
                            </div>
                            <div class="quadrant-chips">
                                ${MATRIX_DATA.complex.ids.map(id => `<span class="matrix-chip" data-id="${id}" title="${id}: ${interventionMap[id] || ''}">${id}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="matrix-axis-x">
                        <span class="axis-label-low">Baixo Esforço</span>
                        <span class="axis-label-high">Alto Esforço</span>
                    </div>
                </div>
            </div>
        `;

        const boardHtml = `
            <h1>${title}</h1>
            ${introHtml || '<p>Este documento organiza todas as intervenções em uma jornada cronológica de recuperação.</p>'}
            
            ${matrixHtml}
            <div class="war-room-board">
                ${phaseData.map(phase => `
                    <div class="board-column ${phase.class}">
                        <div class="board-column-header">
                            <span class="phase-tooltip">${phaseTooltips[phase.num]}</span>
                            <span class="phase-count">${phase.interventions.length}</span>
                            <h3>Frente ${phase.num}: ${phase.name}</h3>
                            <div class="phase-subtitle">${phase.subtitle}</div>
                        </div>
                            <div class="board-column-content">
                        ${phase.interventions.map(int => `
                            <div class="board-card" 
                                 data-id="${int.id}" 
                                 data-title="${int.title.replace(/"/g, '&quot;')}"
                                 data-phase="${phase.num}"
                                 data-tensao="${int.tensao.replace(/"/g, '&quot;')}"
                                 data-descricao="${int.descricao.replace(/"/g, '&quot;')}"
                                 data-objetivo="${int.objetivo.replace(/"/g, '&quot;')}"
                                 data-impacto="${int.impacto.replace(/"/g, '&quot;')}">
                                <div class="card-id">${int.id}</div>
                                <div class="card-title">${int.title}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
            ${summaryHtml ? `<div class="sin-prose" style="margin-top: var(--spacing-xl);">${summaryHtml}</div>` : ''}
            <div class="board-modal-overlay" id="board-modal-overlay">
                <div class="board-modal">
                    <div class="board-modal-header" id="board-modal-header">
                        <div>
                            <div class="modal-id" id="modal-id"></div>
                            <h3 class="modal-title" id="modal-title"></h3>
                        </div>
                        <button class="board-modal-close" id="board-modal-close">×</button>
                    </div>
                    <div class="board-modal-body">
                        <div class="board-modal-section">
                            <div class="section-label">📍 Tensão</div>
                            <div class="section-content" id="modal-tensao"></div>
                        </div>
                        <div class="board-modal-section">
                            <div class="section-label">📝 Descrição</div>
                            <div class="section-content" id="modal-descricao"></div>
                        </div>
                        <div class="board-modal-section">
                            <div class="section-label">🎯 Objetivo</div>
                            <div class="section-content" id="modal-objetivo"></div>
                        </div>
                        <div class="board-modal-section">
                            <div class="section-label">⚡ Impacto</div>
                            <div class="section-content" id="modal-impacto"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return boardHtml;
    }

    /**
     * Setup War Room modal interactions
     */
    setupWarRoomModal() {
        const overlay = document.getElementById('board-modal-overlay');
        if (!overlay) return;

        const closeBtn = document.getElementById('board-modal-close');
        const header = document.getElementById('board-modal-header');
        const idEl = document.getElementById('modal-id');
        const titleEl = document.getElementById('modal-title');
        const tensaoEl = document.getElementById('modal-tensao');
        const descricaoEl = document.getElementById('modal-descricao');
        const objetivoEl = document.getElementById('modal-objetivo');
        const impactoEl = document.getElementById('modal-impacto');

        // Close handlers
        closeBtn?.addEventListener('click', () => overlay.classList.remove('active'));
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        // Card click handlers
        document.querySelectorAll('.board-card').forEach(card => {
            card.addEventListener('click', () => {
                const phase = card.dataset.phase;
                idEl.textContent = card.dataset.id;
                titleEl.textContent = card.dataset.title;
                tensaoEl.textContent = card.dataset.tensao || '-';
                descricaoEl.textContent = card.dataset.descricao || '-';
                objetivoEl.textContent = card.dataset.objetivo || '-';
                impactoEl.textContent = card.dataset.impacto || '-';

                // Set phase class
                header.className = 'board-modal-header phase-' + phase;

                overlay.classList.add('active');
            });
        });
    }

    /**
     * Setup Matrix Spotlight effect
     * Highlights corresponding Kanban card when hovering matrix chips
     */
    setupMatrixSpotlight() {
        const chips = document.querySelectorAll('.matrix-chip');
        const board = document.querySelector('.war-room-board');

        if (!chips.length || !board) return;

        chips.forEach(chip => {
            // Hover: Highlight card in Kanban
            chip.addEventListener('mouseenter', () => {
                const id = chip.dataset.id;
                const targetCard = document.querySelector(`.board-card[data-id="${id}"]`);

                if (targetCard) {
                    board.classList.add('spotlight-active');
                    targetCard.classList.add('spotlight-target');
                    // Removed automatic scroll per user request
                }
            });

            // Mouse leave: Remove highlight
            chip.addEventListener('mouseleave', () => {
                board.classList.remove('spotlight-active');
                document.querySelectorAll('.spotlight-target').forEach(el =>
                    el.classList.remove('spotlight-target')
                );
            });

            // Click: Open modal directly
            chip.addEventListener('click', () => {
                const id = chip.dataset.id;
                const targetCard = document.querySelector(`.board-card[data-id="${id}"]`);
                if (targetCard) {
                    targetCard.click();
                }
            });
        });
    }

    /**
     * Render Article 09 as a Dossier Timeline (Investigation Files)
     */
    renderTimeline(div, config) {
        // Capture intro (everything before the first H2)
        const introElements = [];
        let firstH2 = div.querySelector('h2');
        let current = div.firstElementChild;
        while (current && current !== firstH2) {
            introElements.push(current.cloneNode(true));
            current = current.nextElementSibling;
        }

        const headers = Array.from(div.querySelectorAll('h2'));
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'dossier-timeline';

        headers.forEach(header => {
            const yearMatch = header.textContent.match(/(\d{4})/);
            const year = yearMatch ? yearMatch[1] : '';
            const title = header.textContent.replace(year, '').replace(/^[:\s-]+|[:\s-]+$/g, '').trim();

            const card = document.createElement('div');
            card.className = 'dossier-card';
            card.innerHTML = `
                <div class="dossier-year">${year}</div>
                <div class="dossier-content">
                    <h3 class="dossier-title">${title}</h3>
                    <div class="dossier-body"></div>
                </div>
            `;

            const body = card.querySelector('.dossier-body');
            let next = header.nextElementSibling;
            while (next && next.tagName !== 'H2' && next.tagName !== 'HR') {
                const sibling = next;
                next = sibling.nextElementSibling;

                // Transform specific elements into "Investigation Items"
                const strong = sibling.querySelector('strong');
                const label = strong ? strong.textContent.replace(':', '').trim() : null;

                // Only create investigation-item if label is in iconMap
                if (sibling.tagName === 'P' && label && config.iconMap[label]) {
                    const icon = config.iconMap[label] || '📄';

                    const item = document.createElement('div');
                    item.className = 'investigation-item';
                    item.innerHTML = `
                        <span class="item-label">${icon} ${label}</span>
                        <div class="item-text">${sibling.innerHTML.replace(strong.outerHTML, '').replace(/^[:\s-]+/, '').trim()}</div>
                    `;
                    body.appendChild(item);
                } else if (sibling.tagName === 'UL') {
                    // Turn lists into bulleted investigation steps
                    sibling.classList.add('investigation-list');
                    body.appendChild(sibling);
                } else {
                    body.appendChild(sibling);
                }
            }
            timelineContainer.appendChild(card);
        });

        // Clear and rebuild
        div.innerHTML = '';
        introElements.forEach(el => div.appendChild(el));
        div.appendChild(timelineContainer);

        return div.innerHTML;
    }

    /**
     * Render Article 10 as a Lab Archive (Investigation Slides)
     */
    renderLabArchive(div, config) {
        // Capture intro (everything before the first H2)
        const introElements = [];
        let firstH2 = div.querySelector('h2');
        let current = div.firstElementChild;
        while (current && current !== firstH2) {
            introElements.push(current.cloneNode(true));
            current = current.nextElementSibling;
        }

        const sections = Array.from(div.querySelectorAll('h2'));
        const archiveContainer = document.createElement('div');
        archiveContainer.className = 'lab-archive';

        sections.forEach(section => {
            const isLabSection = /^\d+\./.test(section.textContent);
            const sectionTitle = section.textContent.replace(/^\d+\.\s*/, '').trim();
            const symptomEl = section.nextElementSibling;
            const symptomText = symptomEl && symptomEl.tagName === 'P' ? symptomEl.innerHTML : '';
            if (symptomEl && symptomEl.tagName === 'P') symptomEl.remove();

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'archive-section';

            // Clean symptom text (remove the initial label)
            const cleanSymptom = symptomText.replace(/<strong>.*?<\/strong>\s*/i, '').replace(/^[:\s-]+/, '').trim();

            sectionDiv.innerHTML = `
                <div class="archive-section-header">
                    <span class="section-badge">${isLabSection ? 'Área de Investigação' : 'Análise Geral'}</span>
                    <h2 class="section-title">${sectionTitle}</h2>
                    ${isLabSection ? `<div class="section-symptom"><strong>Sintoma Mapeado:</strong> ${cleanSymptom}</div>` : ''}
                </div>
                <div class="archive-content-body"></div>
                <div class="archive-grid"></div>
            `;

            const grid = sectionDiv.querySelector('.archive-grid');
            const contentBody = sectionDiv.querySelector('.archive-content-body');
            let next = section.nextElementSibling;
            while (next && next.tagName !== 'H2') {
                if (next.tagName === 'H3') {
                    const header = next;
                    const expTitle = header.textContent.replace(/^Exp:\s*|"/g, '').trim();
                    const card = document.createElement('div');
                    card.className = 'lab-card';
                    card.innerHTML = `
                        <div class="lab-card-header">
                            <span class="lab-id">EXP-${Math.floor(Math.random() * 900) + 100}</span>
                            <h3 class="lab-title">${expTitle}</h3>
                        </div>
                        <div class="lab-card-body"></div>
                        <div class="lab-stamp">BARRADO</div>
                    `;

                    const body = card.querySelector('.lab-card-body');
                    let subNext = header.nextElementSibling;
                    let barrierText = '';

                    while (subNext && !['H2', 'H3', 'HR'].includes(subNext.tagName)) {
                        const sibling = subNext;
                        subNext = sibling.nextElementSibling;

                        const processItem = (el) => {
                            const strong = el.querySelector('strong');
                            const label = strong ? strong.textContent.replace(':', '').trim() : null;
                            if (label && config.iconMap[label]) {
                                const icon = config.iconMap[label];
                                const content = el.innerHTML.replace(strong.outerHTML, '').replace(/^[:\s-]+/, '').trim();

                                if (label.includes('Barreira')) {
                                    barrierText = content;
                                }

                                const item = document.createElement('div');
                                item.className = `lab-item ${label.includes('Barreira') ? 'barrier' : ''}`;
                                item.innerHTML = `
                                    <span class="item-label">${icon} ${label}</span>
                                    <div class="item-text">${content}</div>
                                `;
                                body.appendChild(item);
                                return true;
                            }
                            return false;
                        };

                        if (sibling.tagName === 'P') {
                            if (!processItem(sibling)) {
                                body.appendChild(sibling.cloneNode(true));
                            }
                        } else if (sibling.tagName === 'UL') {
                            const lis = Array.from(sibling.querySelectorAll('li'));
                            let processedAny = false;
                            lis.forEach(li => {
                                if (processItem(li)) processedAny = true;
                            });

                            if (!processedAny) {
                                const listClone = sibling.cloneNode(true);
                                listClone.classList.add('lab-list');
                                body.appendChild(listClone);
                            }
                        } else {
                            body.appendChild(sibling.cloneNode(true));
                        }
                    }

                    // Determine Stamp Text based on barrier content
                    const stamp = card.querySelector('.lab-stamp');
                    const lowerBarrier = barrierText.toLowerCase();
                    if (lowerBarrier.includes('budget') || lowerBarrier.includes('custo') || lowerBarrier.includes('investimento')) {
                        stamp.textContent = 'FALTA DE BUDGET';
                        stamp.classList.add('stamp-error');
                    } else if (lowerBarrier.includes('voluntar') || lowerBarrier.includes('tempo') || lowerBarrier.includes('evasão')) {
                        stamp.textContent = 'EVASÃO / TEMPO';
                        stamp.classList.add('stamp-warning');
                    } else if (lowerBarrier.includes('mindset') || lowerBarrier.includes('cultura') || lowerBarrier.includes('tabu')) {
                        stamp.textContent = 'IMUNIDADE CULTURAL';
                        stamp.classList.add('stamp-info');
                    } else if (lowerBarrier.includes('paralisado') || lowerBarrier.includes('concorrentes')) {
                        stamp.textContent = 'PARALISADO';
                        stamp.classList.add('stamp-muted');
                    }

                    grid.appendChild(card);

                    // Advance 'next' to the 'subNext' result (the next section or experiment)
                    next = subNext;
                    header.remove();
                } else {
                    if (next.tagName !== 'HR') {
                        contentBody.appendChild(next.cloneNode(true));
                    }
                    next = next.nextElementSibling;
                }
            }
            archiveContainer.appendChild(sectionDiv);
            section.remove();
        });

        // Clear and rebuild
        div.innerHTML = '';
        introElements.forEach(el => div.appendChild(el));
        div.appendChild(archiveContainer);

        return div.innerHTML;
    }

    /**
     * Render Article 05 as Case Files (Tabbed Interface)
     */
    renderCaseFiles(div, config) {
        // Find the "Parte I" header
        const part1Header = Array.from(div.querySelectorAll('h2')).find(h => h.textContent.includes('Parte I'));
        if (!part1Header) return div.innerHTML;

        // Create Container
        const container = document.createElement('div');
        container.className = 'dossier-tabs-container';

        // Create Tabs Wrapper
        const tabsWrapper = document.createElement('div');
        tabsWrapper.className = 'dossier-tabs';

        // Content Area
        const contentArea = document.createElement('div');
        contentArea.className = 'dossier-case-content';

        container.appendChild(tabsWrapper);
        container.appendChild(contentArea);

        // Find h3s after Part I
        const cases = [];
        let next = part1Header.nextElementSibling;

        // Remove Part I header as it becomes implicit in the tabs
        part1Header.remove();

        while (next && next.tagName !== 'H2') {
            if (next.tagName === 'H3') {
                const header = next;
                let title = header.textContent.replace(/^\d+\.\s*/, '').trim();

                // Extract specific labels per user request
                let shortTitle = title;
                if (title.toLowerCase().includes('cajamar')) {
                    shortTitle = 'FOOD Leroy Merlin';
                } else if (title.toLowerCase().includes('guarulhos') && title.toLowerCase().includes('food')) {
                    shortTitle = 'FOOD União Química';
                } else if (title.toLowerCase().includes('guarulhos') && (title.toLowerCase().includes('fm') || title.toLowerCase().includes('limpeza'))) {
                    shortTitle = 'FM União Química';
                }

                const caseObj = {
                    id: `case-${cases.length}`,
                    title: title,
                    tabLabel: shortTitle,
                    contentNodes: []
                };

                // Add Title as a clean header inside the pane
                const paneTitle = document.createElement('h3');
                paneTitle.textContent = title;
                paneTitle.style.marginTop = '0';
                paneTitle.style.color = 'var(--color-teal-dark)';
                caseObj.contentNodes.push(paneTitle);

                let contentNext = header.nextElementSibling;
                while (contentNext && contentNext.tagName !== 'H3' && contentNext.tagName !== 'H2') {
                    // Just clone the content nodes without any icon processing
                    caseObj.contentNodes.push(contentNext.cloneNode(true));
                    const toRemove = contentNext;
                    contentNext = contentNext.nextElementSibling;
                    toRemove.remove();
                }

                cases.push(caseObj);
                header.remove(); // Remove the H3
                next = contentNext; // Continue from where we left off
            } else {
                next = next.nextElementSibling;
            }
        }

        // Build Tabs and Content
        cases.forEach((c, index) => {
            // Tab
            const tab = document.createElement('button');
            tab.className = `dossier-tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = c.tabLabel;
            tab.dataset.target = c.id;

            tab.onclick = () => {
                // Switch Active Tab
                container.querySelectorAll('.dossier-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Switch Active Content
                container.querySelectorAll('.dossier-pane').forEach(p => p.classList.remove('active'));
                const targetPane = container.querySelector(`#${c.id}`);
                if (targetPane) targetPane.classList.add('active');
            };

            tabsWrapper.appendChild(tab);

            // Pane
            const pane = document.createElement('div');
            pane.id = c.id;
            pane.className = `dossier-pane ${index === 0 ? 'active' : ''}`;

            // Clean content without any metadata stamps
            c.contentNodes.forEach(node => pane.appendChild(node));
            contentArea.appendChild(pane);
        });

        // Insert container where Part I was
        const part2Header = Array.from(div.querySelectorAll('h2')).find(h => h.textContent.includes('Parte II'));
        if (part2Header) {
            div.insertBefore(container, part2Header);
        } else {
            div.appendChild(container); // Fallback
        }

        return div.innerHTML;
    }

    /**
     * Post-process HTML to wrap incentives and hierarchy in Article 01
     */
    renderIncentives(html) {
        // Obsolete but kept for reference if needed, use processArticleContent
        return html;
    }

    slugify(text) {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    /**
     * Fix relative image paths and process interventions
     */
    fixImagePaths(html, articlePath) {
        // First, transform content based on article type
        let processedHtml = html;
        if (articlePath.includes('08-plano-de-intervencao-estrategica')) {
            // War Room Dashboard for Article 08
            processedHtml = this.renderWarRoom(html);
        } else if (articlePath.includes('roteiro-investigacao-unidades')) {
            processedHtml = this.renderInvestigationForm(html);
        } else {
            // Unify logic for 01-07
            const articleId = this.findArticleIdByPath(articlePath);
            if (articleId) {
                processedHtml = this.processArticleContent(html, articleId);
            }
        }

        const div = document.createElement('div');
        div.innerHTML = processedHtml;

        // Get the directory of the article
        const articleDir = articlePath.substring(0, articlePath.lastIndexOf('/') + 1);

        div.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                // Resolve the path relative to the article's directory
                // articleDir is like '../Refined/'
                // src might be '../Intervencoes/image.png'
                // Combined: '../Refined/../Intervencoes/image.png' = '../Intervencoes/image.png'
                const resolvedPath = this.resolvePath(articleDir, src);
                img.src = resolvedPath;

                // Add loading lazy for performance
                img.loading = 'lazy';

                // Add alt text if missing
                if (!img.alt) {
                    img.alt = 'Imagem do relatório';
                }
            }
        });

        return div.innerHTML;
    }

    findArticleIdByPath(path) {
        if (!path) return null;
        // Extracts the ID (e.g., '01') from paths like 'Refined/01-...'
        const match = path.match(/(\d\d)-/);
        return match ? match[1] : null;
    }

    /**
     * Resolve relative path from base directory
     */
    resolvePath(base, relative) {
        // Simple path resolution
        // base: '../Refined/'
        // relative: '../Intervencoes/image.png'
        // result: '../Intervencoes/image.png' (from report-reader perspective)

        const baseParts = base.split('/').filter(p => p && p !== '.');
        const relativeParts = relative.split('/').filter(p => p && p !== '.');

        const result = [...baseParts];

        for (const part of relativeParts) {
            if (part === '..') {
                result.pop();
            } else {
                result.push(part);
            }
        }

        return result.join('/');
    }

    /**
     * Render breadcrumbs based on current article
     */
    renderBreadcrumbs(article) {
        if (!this.breadcrumbEl) return;

        if (article.id === '00') {
            this.breadcrumbEl.innerHTML = `
                <span class="breadcrumb-item">Relatório</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-active">${article.title}</span>
            `;
        } else {
            this.breadcrumbEl.innerHTML = `
                <a href="#00" class="breadcrumb-item">Relatório</a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-active">${article.title}</span>
            `;
        }
    }

    /**
     * Update active state in navigation
     */
    updateActiveNav(activeId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const isActive = link.dataset.id === activeId;
            link.classList.toggle('active', isActive);
        });
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.contentEl.classList.add('loading');
        this.contentEl.innerHTML = 'Carregando';
    }

    /**
     * Scroll content to top
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Setup reading progress indicator
     */
    setupScrollProgress() {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            if (this.progressBarEl) {
                this.progressBarEl.style.width = `${progress}%`;
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.reportReader = new ReportReader();
});
