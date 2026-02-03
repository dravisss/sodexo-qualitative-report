import { escapeHtml } from './utils.js';
import { loadAllCls } from './sap-cl-data.js';

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

function money(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function pct(n) {
  const v = Number(n) || 0;
  return (v * 100).toFixed(1) + '%';
}

function colorForGm(gm) {
  const v = Number(gm) || 0;
  if (v >= 0.25) return 'good';
  if (v >= 0.15) return 'mid';
  return 'bad';
}

function renderKpiTable(items) {
  const rows = items.map(d => {
    const k = d.kpis;
    return `
      <tr>
        <td><strong>${escapeHtml(d.cl.label)}</strong></td>
        <td>${escapeHtml(pct(k.realFy25.gm))}</td>
        <td>${escapeHtml(pct(k.realFy26Ytd.gm))}</td>
        <td>${escapeHtml((k.deltas.gmPp * 100).toFixed(1) + ' pp')}</td>
        <td>${escapeHtml(pct(k.deltas.faturamentoPct))}</td>
        <td>${escapeHtml(pct(k.deltas.gpPct))}</td>
        <td>${escapeHtml(pct(k.deltas.pessoalPct))}</td>
        <td>${escapeHtml(pct(k.deltas.consumoPct))}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="wr-panel">
      <h3>KPIs (FY25 vs FY26 YTD)</h3>
      <div class="wr-table-wrap">
        <table class="wr-table">
          <thead>
            <tr>
              <th>CL</th>
              <th>GM% FY25</th>
              <th>GM% FY26 YTD</th>
              <th>Δ GM (pp)</th>
              <th>Δ% Fat vs Budget</th>
              <th>Δ% GP vs Budget</th>
              <th>Δ% Pessoal vs Budget</th>
              <th>Δ% Consumo vs Budget</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderGmHeatmap(items) {
  const months = items[0]?.series?.fy26Months || [];

  const header = `
    <tr>
      <th>CL</th>
      ${months.map(m => `<th>${escapeHtml(m)}</th>`).join('')}
    </tr>
  `;

  const rows = items.map(d => {
    const cells = d.series.fy26.gmPct.map(gm => {
      const cls = colorForGm(gm);
      return `<td class="wr-heat ${cls}">${escapeHtml(pct(gm))}</td>`;
    }).join('');

    return `
      <tr>
        <td><strong>${escapeHtml(d.cl.id)}</strong></td>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div class="wr-panel">
      <h3>Heatmap — GM% por mês (FY26 YTD)</h3>
      <p class="wr-muted">Cores são heurísticas para leitura rápida, não julgamento final.</p>
      <div class="wr-table-wrap">
        <table class="wr-table">
          <thead>${header}</thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNarrative(items) {
  const sorted = [...items].sort((a, b) => (b.kpis.realFy26Ytd.gm - a.kpis.realFy26Ytd.gm));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return `
    <div class="wr-panel">
      <h3>Leitura (comparativo)</h3>
      <p>${escapeHtml(`No FY26 YTD, o maior GM% está em ${best.cl.label} (${pct(best.kpis.realFy26Ytd.gm)}), enquanto o menor GM% está em ${worst.cl.label} (${pct(worst.kpis.realFy26Ytd.gm)}).`)}</p>
      <p>${escapeHtml('Use a tabela de KPIs para ver se a diferença vem mais de faturamento, consumo ou pessoal (via desvios vs budget), e o heatmap para localizar meses específicos.')}</p>
    </div>
  `;
}

async function init() {
  setupShellInteractions();

  const loading = document.getElementById('wr-compare-loading');
  const root = document.getElementById('wr-compare-root');
  if (!loading || !root) return;

  try {
    const items = await loadAllCls();
    root.innerHTML = `
      <div class="wr-stack">
        <div class="wr-grid-2">
          ${renderNarrative(items)}
          <div class="wr-panel">
            <h3>Escopo</h3>
            <p class="wr-muted">Comparação usa apenas meses disponíveis no Real (FY26 YTD). Budget é recortado para os mesmos meses.</p>
          </div>
        </div>
        ${renderKpiTable(items)}
        ${renderGmHeatmap(items)}
      </div>
    `;

    loading.style.display = 'none';
    root.style.display = 'block';
  } catch (e) {
    loading.classList.remove('loading');
    loading.innerHTML = `<div class="warroom-error"><h2>Erro ao carregar dados</h2><p><code>${escapeHtml(String(e && e.message ? e.message : e))}</code></p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
