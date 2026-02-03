import { fetchText } from './utils.js';

function setupShellInteractions() {
  const sidebar = document.querySelector('.sin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebarToggle = document.getElementById('sidebar-toggle');

  const toggleMobileMenu = (open) => {
    if (!sidebar) return;
    const isOpen = typeof open === 'boolean' ? open : !sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', isOpen);
    if (overlay) overlay.classList.toggle('active', isOpen);
  };

  const toggleSidebar = () => {
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
  };

  if (mobileToggle) mobileToggle.addEventListener('click', () => toggleMobileMenu());
  if (overlay) overlay.addEventListener('click', () => toggleMobileMenu(false));
  if (sidebarToggle) sidebarToggle.addEventListener('click', () => toggleSidebar());
}

function parseMarkdown(markdown) {
  if (typeof marked !== 'undefined') {
    const alertExtension = {
      name: 'alert',
      level: 'block',
      start(src) { return src.match(/^> \[!/)?.index; },
      tokenizer(src) {
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

function renderWarRoom(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  const h1 = div.querySelector('h1');
  const title = h1 ? h1.textContent : 'Plano de Intervenção';
  if (h1) h1.remove();

  const phases = [
    { num: 1, name: 'TORNIQUETE', subtitle: 'Imediato', class: 'phase-1' },
    { num: 2, name: 'DESCOMPRESSÃO', subtitle: 'Curto Prazo', class: 'phase-2' },
    { num: 3, name: 'REESTRUTURAÇÃO', subtitle: 'Médio Prazo', class: 'phase-3' },
    { num: 4, name: 'REPOSICIONAMENTO', subtitle: 'Longo Prazo', class: 'phase-4' }
  ];

  const phaseData = phases.map(p => ({ ...p, interventions: [] }));

  const h4s = Array.from(div.querySelectorAll('h4'));
  const interventionMap = {};

  h4s.forEach(h4 => {
    const match = h4.textContent.match(/^(I-\d+)\s*[—|-]\s*(.*)$/);
    if (!match) return;

    interventionMap[match[1]] = match[2];

    let phaseIndex = 0;
    let el = h4.previousElementSibling;
    while (el) {
      if (el.tagName === 'H2') {
        const pm = el.textContent.match(/(?:FASE|FRENTE)\s*(\d)/i);
        if (pm) {
          phaseIndex = parseInt(pm[1], 10) - 1;
          break;
        }
      }
      el = el.previousElementSibling;
    }

    const fields = { tensao: '', descricao: '', objetivo: '', impacto: '' };
    let next = h4.nextElementSibling;
    let fullText = '';

    while (next && !['H1', 'H2', 'H3', 'H4', 'HR'].includes(next.tagName)) {
      fullText += ' ' + (next.textContent || '');
      next = next.nextElementSibling;
    }

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
  });

  let introHtml = '';
  let nextEl = div.firstElementChild;
  while (nextEl && nextEl.tagName !== 'H2') {
    introHtml += nextEl.outerHTML;
    nextEl = nextEl.nextElementSibling;
  }

  let summaryHtml = '';
  const tables = Array.from(div.querySelectorAll('table'));
  if (tables.length > 0) {
    const lastTable = tables[tables.length - 1];
    const prevH2 = lastTable.previousElementSibling;
    if (prevH2 && prevH2.textContent.includes('Resumo')) {
      summaryHtml = `<h2>${prevH2.textContent}</h2>${lastTable.outerHTML}`;
    } else {
      summaryHtml = lastTable.outerHTML;
    }
  }

  const phaseTooltips = {
    1: 'Ações imediatas para estancar hemorragia operacional e restaurar dignidade básica.',
    2: 'Intervenções de curto prazo para aliviar pressão e melhorar o clima.',
    3: 'Mudanças estruturais de médio prazo nas regras e processos.',
    4: 'Transformações de longo prazo para reposicionamento estratégico.'
  };

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

  return `
    <article class="sin-prose">
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
                     data-title="${String(int.title).replace(/\"/g, '&quot;')}"
                     data-phase="${phase.num}"
                     data-tensao="${String(int.tensao || '').replace(/\"/g, '&quot;')}"
                     data-descricao="${String(int.descricao || '').replace(/\"/g, '&quot;')}"
                     data-objetivo="${String(int.objetivo || '').replace(/\"/g, '&quot;')}"
                     data-impacto="${String(int.impacto || '').replace(/\"/g, '&quot;')}">
                  <div class="card-id">${int.id}</div>
                  <div class="card-title">${int.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      ${summaryHtml ? `<div class="sin-prose" style="margin-top: var(--spacing-xl);">${summaryHtml}</div>` : ''}
    </article>
    <div class="board-modal-overlay" id="board-modal-overlay">
      <div class="board-modal">
        <div class="board-modal-header" id="board-modal-header">
          <div class="modal-header-main">
            <div class="modal-id" id="modal-id"></div>
            <h3 class="modal-title" id="modal-title"></h3>
            <div class="cta-button-container" id="modal-actions"></div>
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
}

function setupPlanHubLinks(root) {
  const article = root.querySelector('article');
  if (!article) return;

  const headings = article.querySelectorAll('h4');
  headings.forEach(h => {
    const text = (h.textContent || '').trim();
    const m = text.match(/^(I-\d{2})\b/);
    if (!m) return;

    const id = m[1];
    const existing = h.nextElementSibling;
    if (existing && existing.classList && existing.classList.contains('cta-button-container')) return;

    const container = document.createElement('div');
    container.className = 'cta-button-container';

    const dossier = document.createElement('a');
    dossier.className = 'cta-button';
    dossier.href = `dossie.html?i=${encodeURIComponent(id)}`;
    dossier.textContent = '📄 Abrir Dossiê';

    const arg = document.createElement('a');
    arg.className = 'cta-button';
    arg.href = `argumentario.html?i=${encodeURIComponent(id)}`;
    arg.textContent = '🧾 Abrir Argumentário';

    const kanban = document.createElement('a');
    kanban.className = 'cta-button';
    kanban.href = `kanban.html?card=${encodeURIComponent(id)}`;
    kanban.textContent = '📋 Abrir Kanban';

    container.appendChild(dossier);
    container.appendChild(arg);
    container.appendChild(kanban);

    h.insertAdjacentElement('afterend', container);
  });
}

function setupWarRoomModal() {
  const overlay = document.getElementById('board-modal-overlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('board-modal-close');
  const header = document.getElementById('board-modal-header');
  const idEl = document.getElementById('modal-id');
  const titleEl = document.getElementById('modal-title');
  const actionsEl = document.getElementById('modal-actions');
  const tensaoEl = document.getElementById('modal-tensao');
  const descricaoEl = document.getElementById('modal-descricao');
  const objetivoEl = document.getElementById('modal-objetivo');
  const impactoEl = document.getElementById('modal-impacto');

  closeBtn?.addEventListener('click', () => overlay.classList.remove('active'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });

  document.querySelectorAll('.board-card').forEach(card => {
    card.addEventListener('click', () => {
      const phase = card.dataset.phase;
      const id = card.dataset.id;

      if (idEl) idEl.textContent = id;
      if (titleEl) titleEl.textContent = card.dataset.title || '';
      if (tensaoEl) tensaoEl.textContent = card.dataset.tensao || '-';
      if (descricaoEl) descricaoEl.textContent = card.dataset.descricao || '-';
      if (objetivoEl) objetivoEl.textContent = card.dataset.objetivo || '-';
      if (impactoEl) impactoEl.textContent = card.dataset.impacto || '-';

      if (actionsEl) {
        actionsEl.innerHTML = '';

        const dossier = document.createElement('a');
        dossier.className = 'cta-button';
        dossier.href = `dossie.html?i=${encodeURIComponent(id)}`;
        dossier.textContent = '📄 Dossiê';

        const arg = document.createElement('a');
        arg.className = 'cta-button';
        arg.href = `argumentario.html?i=${encodeURIComponent(id)}`;
        arg.textContent = '🧾 Argumentário';

        const kanban = document.createElement('a');
        kanban.className = 'cta-button';
        kanban.href = `kanban.html?card=${encodeURIComponent(id)}`;
        kanban.textContent = '📋 Kanban';

        actionsEl.appendChild(dossier);
        actionsEl.appendChild(arg);
        actionsEl.appendChild(kanban);
      }

      if (header) header.className = 'board-modal-header phase-' + phase;
      overlay.classList.add('active');
    });
  });

  const chips = document.querySelectorAll('.matrix-chip');
  const board = document.querySelector('.war-room-board');
  if (chips.length && board) {
    chips.forEach(chip => {
      chip.addEventListener('mouseenter', () => {
        const id = chip.dataset.id;
        const targetCard = document.querySelector(`.board-card[data-id="${id}"]`);
        if (targetCard) {
          board.classList.add('spotlight-active');
          targetCard.classList.add('spotlight-target');
        }
      });

      chip.addEventListener('mouseleave', () => {
        board.classList.remove('spotlight-active');
        document.querySelectorAll('.spotlight-target').forEach(el => el.classList.remove('spotlight-target'));
      });

      chip.addEventListener('click', () => {
        const id = chip.dataset.id;
        const targetCard = document.querySelector(`.board-card[data-id="${id}"]`);
        if (targetCard) targetCard.click();
      });
    });
  }
}

async function init() {
  const contentEl = document.getElementById('wr-plan-content');
  if (!contentEl) return;

  try {
    setupShellInteractions();
    const md = await fetchText('./Refined/08-plano-de-intervencao-estrategica.md');
    const html = parseMarkdown(md);
    contentEl.classList.remove('loading');
    contentEl.innerHTML = renderWarRoom(html);

    setupWarRoomModal();
    setupPlanHubLinks(contentEl);
  } catch (e) {
    console.error(e);
    contentEl.classList.remove('loading');
    contentEl.innerHTML = `<div class="error-message"><h2>Erro ao carregar plano</h2><p><code>${String(e && e.message ? e.message : e)}</code></p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
