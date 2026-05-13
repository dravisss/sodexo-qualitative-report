import { INTERVENTION_DOSSIERS } from '../interventions.config.js';
import {
  fetchText,
  parseFrontmatter,
  getKanbanStatus,
  normalizeStatusLabel,
  escapeHtml
} from './utils.js';

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

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
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

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [String(value)];
}

function getTitleFromContent(markdown) {
  const m = String(markdown || '').match(/^#\s+(.+)$/m);
  if (!m) return '';
  return m[1].trim();
}

function normalizeTitle(id, title) {
  const t = String(title || '').trim();
  if (!t) return '';
  const pattern = new RegExp(`^${id}\\s*[—\u2014\u2013-]\\s*`, 'i');
  return t.replace(pattern, '').trim();
}

function getArgumentarioPath(dossierPath) {
  // ./intervencoes/I-01-foo.md -> ./intervencoes/I-01-foo.argumentario.md
  return String(dossierPath || '').replace(/\.md$/i, '.argumentario.md');
}

function renderHeader({ id, title, status, units, front, tags, evidence_strength, eixo, dossierPath }) {
  const unitsArr = normalizeList(units);
  const tagsArr = normalizeList(tags);
  const cleanTitle = normalizeTitle(id, title);

  const badges = [
    renderStatusBadge(status),
    front ? renderBadge(front) : '',
    eixo ? renderBadge(eixo, 'badge-eixo') : '',
    evidence_strength ? renderBadge(evidence_strength) : '',
    ...unitsArr.map(u => renderBadge(u)),
    ...tagsArr.map(t => renderBadge(t))
  ].filter(Boolean).join('');

  const dossierHref = `dossie.html?i=${encodeURIComponent(id)}`;
  const argumentarioHref = `argumentario.html?i=${encodeURIComponent(id)}`;

  return `
    <div class="warroom-dossier-header-inner">
      <div>
        <div class="warroom-breadcrumb">
          <a href="warroom.html">War Room</a> <span>›</span> <span>${escapeHtml(id)}</span>
        </div>
        <h1 class="warroom-dossier-title">${escapeHtml(id)} — ${escapeHtml(cleanTitle || '')}</h1>
        <div class="warroom-dossier-badges">${badges}</div>
      </div>
      <div class="warroom-dossier-actions">
        <a class="warroom-btn" href="${dossierHref}">📄 Abrir Dossiê</a>
        <a class="warroom-btn" href="${argumentarioHref}">🧾 Argumentário</a>
        <a class="warroom-btn" href="kanban.html?card=${encodeURIComponent(id)}">📋 Abrir Kanban</a>
        <a class="warroom-btn" href="warroom.html">🧭 Voltar</a>
      </div>
    </div>
  `;
}

async function main() {
  const id = getParam('i');
  const headerEl = document.getElementById('wr-argumentario-header');
  const contentEl = document.getElementById('wr-argumentario-content');

  if (!id) {
    if (headerEl) {
      headerEl.innerHTML = `
        <div class="warroom-dossier-header-inner">
          <div>
            <div class="warroom-breadcrumb">
              <a href="index.html#08">Plano</a> <span>›</span> <span>Argumentários</span>
            </div>
            <h1 class="warroom-dossier-title">Argumentários</h1>
          </div>
          <div class="warroom-dossier-actions">
            <a class="warroom-btn" href="index.html#08">🧭 Abrir Plano (Hub)</a>
            <a class="warroom-btn" href="kanban.html">📋 Abrir Kanban</a>
          </div>
        </div>
      `;
    }

    if (contentEl) {
      const items = [...INTERVENTION_DOSSIERS]
        .sort((a, b) => parseInt(a.id.replace('I-', ''), 10) - parseInt(b.id.replace('I-', ''), 10));

      contentEl.classList.remove('loading');
      contentEl.innerHTML = `
        <article class="sin-prose">
          <h2>Selecione uma intervenção</h2>
          <ul>
            ${items.map(d => `
              <li>
                <strong>${escapeHtml(d.id)}</strong>
                — <a href="argumentario.html?i=${encodeURIComponent(d.id)}">Argumentário</a>
                | <a href="dossie.html?i=${encodeURIComponent(d.id)}">Dossiê</a>
                | <a href="kanban.html?card=${encodeURIComponent(d.id)}">Kanban</a>
              </li>
            `).join('')}
          </ul>
        </article>
      `;
    }

    return;
  }

  const dossier = INTERVENTION_DOSSIERS.find(d => d.id === id);
  if (!dossier) {
    if (contentEl) {
      contentEl.classList.remove('loading');
      contentEl.innerHTML = `<div class="warroom-error"><h2>Intervenção não encontrada</h2><p>Não existe dossiê registrado para <code>${escapeHtml(id)}</code>.</p></div>`;
    }
    return;
  }

  const argumentarioPath = getArgumentarioPath(dossier.path);

  try {
    const [md, kanbanState] = await Promise.all([
      fetchText(argumentarioPath),
      loadKanbanState()
    ]);

    const { frontmatter, content } = parseFrontmatter(md);

    const title = frontmatter.title || getTitleFromContent(content) || '';
    const status = getKanbanStatus(kanbanState, id);

    if (headerEl) {
      headerEl.innerHTML = renderHeader({
        id,
        title,
        status,
        units: frontmatter.units,
        front: frontmatter.front,
        tags: frontmatter.tags,
        evidence_strength: frontmatter.evidence_strength,
        eixo: frontmatter.eixo,
        dossierPath: dossier.path
      });
    }

    if (typeof marked === 'undefined') {
      throw new Error('Marked.js não carregou');
    }

    const html = marked.parse(content);

    if (contentEl) {
      contentEl.classList.remove('loading');
      contentEl.innerHTML = `<article class="sin-prose">${html}</article>`;
    }

  } catch (err) {
    if (contentEl) {
      contentEl.classList.remove('loading');
      contentEl.innerHTML = `<div class="warroom-error"><h2>Erro ao carregar argumentário</h2><p><code>${escapeHtml(err.message)}</code></p></div>`;
    }
  }
}

main();
