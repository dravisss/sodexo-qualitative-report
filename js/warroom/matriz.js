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

async function init() {
  const contentEl = document.getElementById('wr-matrix-content');
  if (!contentEl) return;

  try {
    setupShellInteractions();
    const md = await fetchText('./matriz-intervencoes.md');
    const html = parseMarkdown(md);

    contentEl.classList.remove('loading');
    contentEl.innerHTML = `<article class="sin-prose">${html}</article>`;
  } catch (e) {
    console.error(e);
    contentEl.classList.remove('loading');
    contentEl.innerHTML = `<div class="error-message"><h2>Erro ao carregar matriz</h2><p><code>${String(e && e.message ? e.message : e)}</code></p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
