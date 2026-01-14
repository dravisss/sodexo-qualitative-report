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

            // Setup intervention toggles
            this.setupInterventionToggles();

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
                idPrefixes: ['1.', '2.', '3.', '4.', '5.'],
                sectionLabelMap: { '1': 'Competição', '2': 'Armadilha', '3': 'Crise', '4': 'Pressão', '5': 'Competição' },
                iconMap: {
                    'O Que Mudou': '🔄', 'Consequência': '🚨', 'O Incentivo Estrutural': '⚖️', 'O Corte do "Invisível"': '✂️'
                }
            },
            '07': {
                cardSelector: 'h3',
                idPrefixes: ['🔴', '🟠', '🟡'],
                sectionLabelMap: { '🔴': 'Crítico', '🟠': 'Alto', '🟡': 'Médio' },
                iconMap: { 'O que é': '❓', 'Exposição estimada': '💰', 'Multicausalidade': '🧬' }
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
            for (const prefix of artConfig.idPrefixes) {
                if (text.startsWith(prefix)) {
                    match = { prefix: prefix.replace('.', ''), label: text.replace(prefix, '').trim() };
                    break;
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
        // First, transform interventions if this is the intervention plan
        let processedHtml = html;
        if (articlePath.includes('08-plano-de-intervencao-estrategica')) {
            processedHtml = this.renderInterventions(html);
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
