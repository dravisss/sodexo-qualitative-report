import { INTERVENTION_DOSSIERS } from '../interventions.config.js';
import {
  fetchText,
  parseFrontmatter,
  getKanbanStatus,
  normalizeStatusLabel,
  escapeHtml
} from './utils.js';

function parseIdNumber(id) {
  const m = String(id || '').match(/^I-(\d+)$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

function getTitleFromContent(markdown) {
  const m = String(markdown || '').match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

function normalizeTitle(id, title) {
  const t = String(title || '').trim();
  if (!t) return '';
  const pattern = new RegExp(`^${id}\\s*[—\u2014\u2013-]\\s*`, 'i');
  return t.replace(pattern, '').trim();
}

function buildSearchText(item) {
  const tags = Array.isArray(item.tags) ? item.tags.join(' ') : String(item.tags || '');
  const units = Array.isArray(item.units) ? item.units.join(' ') : String(item.units || '');
  return `${item.id} ${item.title} ${tags} ${units} ${item.front || ''}`.toLowerCase();
}

function renderBadge(text, extraClass = '') {
  const cls = extraClass ? `badge ${extraClass}` : 'badge';
  return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

function renderStatusBadge(status) {
  const s = String(status || 'backlog');
  const label = normalizeStatusLabel(s);
  return `<span class="badge badge-status ${escapeHtml(s)}">${escapeHtml(label)}</span>`;
}

function renderCard(item) {
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 2) : [];
  const units = Array.isArray(item.units) ? item.units : (item.units ? [item.units] : []);
  const cleanTitle = normalizeTitle(item.id, item.title);
  const statusClass = `status-${String(item.status || 'backlog')}`;

  return `
    <div class="warroom-card ${escapeHtml(statusClass)}" data-id="${escapeHtml(item.id)}" tabindex="0" role="button" aria-label="Abrir ${escapeHtml(item.id)}">
      <div class="warroom-card-header">
        <div class="warroom-card-id">${escapeHtml(item.id)}</div>
        ${renderStatusBadge(item.status)}
      </div>
      <div class="warroom-card-title">${escapeHtml(cleanTitle || item.title || '-')}</div>
      <div class="warroom-card-meta">
        ${item.front ? renderBadge(item.front) : ''}
        ${units.slice(0, 1).map(u => renderBadge(u)).join('')}
        ${tags.map(t => renderBadge(t)).join('')}
      </div>
    </div>
  `;
}

function buildBoardSkeleton() {
  const columns = [
    { id: 'backlog', title: 'Backlog', icon: '📥' },
    { id: 'doing', title: 'Em andamento', icon: '🚧' },
    { id: 'blocked', title: 'Bloqueado', icon: '⛔' },
    { id: 'done', title: 'Concluído', icon: '✅' }
  ];

  return columns.map(c => `
    <section class="wr-column" data-status="${c.id}">
      <div class="wr-column-header">
        <div class="wr-column-title">${c.icon} ${c.title}</div>
        <div class="wr-count" id="wr-count-${c.id}">0</div>
      </div>
      <div class="wr-column-body" id="wr-col-${c.id}"></div>
    </section>
  `).join('');
}

function renderBoard(boardEl, items) {
  const byStatus = { backlog: [], doing: [], blocked: [], done: [] };
  items.forEach(it => {
    const s = String(it.status || 'backlog');
    if (!byStatus[s]) byStatus[s] = [];
    byStatus[s].push(it);
  });

  Object.keys(byStatus).forEach(status => {
    const colEl = document.getElementById(`wr-col-${status}`);
    if (!colEl) return;
    colEl.innerHTML = byStatus[status].map(renderCard).join('');

    const countEl = document.getElementById(`wr-count-${status}`);
    if (countEl) countEl.textContent = String(byStatus[status].length);
  });

  boardEl.querySelectorAll('.warroom-card').forEach(el => {
    const id = el.getAttribute('data-id');
    const open = () => {
      window.location.href = `dossie.html?i=${encodeURIComponent(id)}`;
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

async function loadKanbanState() {
  try {
    const response = await fetch('/.netlify/functions/kanban-state');
    if (!response.ok) return {};
    const json = await response.json();
    return json && typeof json === 'object' ? json : {};
  } catch {
    return {};
  }
}

async function loadDossiers() {
  const kanbanState = await loadKanbanState();

  const items = [];
  for (const d of INTERVENTION_DOSSIERS) {
    const md = await fetchText(d.path);
    const { frontmatter, content } = parseFrontmatter(md);

    const id = frontmatter.id || d.id;
    const title = frontmatter.title || getTitleFromContent(content) || '';

    items.push({
      id,
      path: d.path,
      title,
      units: frontmatter.units,
      front: frontmatter.front,
      tags: frontmatter.tags,
      evidence_strength: frontmatter.evidence_strength,
      status: getKanbanStatus(kanbanState, id),
      _searchText: buildSearchText({
        id,
        title,
        units: frontmatter.units,
        front: frontmatter.front,
        tags: frontmatter.tags
      })
    });
  }

  items.sort((a, b) => parseIdNumber(a.id) - parseIdNumber(b.id));
  return items;
}

function applyFilters(items, query, status) {
  const q = String(query || '').trim().toLowerCase();
  const s = String(status || '').trim().toLowerCase();

  return items.filter(item => {
    if (s && String(item.status || '').toLowerCase() !== s) return false;
    if (!q) return true;
    return item._searchText.includes(q);
  });
}

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

async function main() {
  setupShellInteractions();

  const loadingEl = document.getElementById('wr-loading');
  const boardEl = document.getElementById('wr-board');
  const searchEl = document.getElementById('wr-search');
  const statusEl = document.getElementById('wr-status');

  try {
    const items = await loadDossiers();

    if (boardEl) {
      boardEl.innerHTML = buildBoardSkeleton();
    }

    const render = () => {
      const filtered = applyFilters(items, searchEl?.value, statusEl?.value);
      if (boardEl) {
        renderBoard(boardEl, filtered);

        const selectedStatus = String(statusEl?.value || '').trim();
        boardEl.querySelectorAll('.wr-column').forEach(col => {
          const s = col.getAttribute('data-status');
          col.style.display = (selectedStatus && s !== selectedStatus) ? 'none' : '';
        });
      }

      if (filtered.length === 0 && boardEl) {
        boardEl.innerHTML = `<div class="warroom-error">Nenhum item encontrado para os filtros atuais.</div>`;
      }
    };

    if (searchEl) searchEl.addEventListener('input', render);
    if (statusEl) statusEl.addEventListener('change', render);

    if (loadingEl) loadingEl.style.display = 'none';
    if (boardEl) {
      boardEl.style.display = '';
      render();
    }

  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (boardEl) {
      boardEl.style.display = '';
      boardEl.innerHTML = `<div class="warroom-error"><h2>Erro ao carregar War Room</h2><p><code>${escapeHtml(err.message)}</code></p></div>`;
    }
  }
}

main();
