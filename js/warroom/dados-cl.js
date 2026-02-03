import { escapeHtml } from './utils.js';
import { CL_CONFIG, loadClData } from './sap-cl-data.js';

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

function tooltip(label, tooltipText) {
  return `<span class="wr-tooltip" data-tooltip="${escapeHtml(tooltipText)}">${escapeHtml(label)} <span class="wr-tooltip-icon">?</span></span>`;
}

function renderKpiCard({ title, value, subtitle, tooltipText }) {
  const t = tooltipText ? tooltip(title, tooltipText) : escapeHtml(title);
  const sub = subtitle ? `<div class="wr-kpi-sub">${escapeHtml(subtitle)}</div>` : '';
  return `
    <div class="wr-kpi">
      <div class="wr-kpi-title">${t}</div>
      <div class="wr-kpi-value">${escapeHtml(value)}</div>
      ${sub}
    </div>
  `;
}

function pickTopDeviations(series, metricKey, topN = 3) {
  const devs = series.fy26.deviationsPctByMetric[metricKey] || [];
  const items = devs.map((v, i) => ({ i, v })).filter(x => Number.isFinite(x.v));
  items.sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
  return items.slice(0, topN);
}

function renderOutliers(data) {
  const items = (data.outliers || []).slice(0, 8);
  if (!items.length) {
    return `<div class="wr-panel"><h3>Alertas</h3><p class="wr-muted">Nenhum alerta acionado pelas regras atuais.</p></div>`;
  }

  return `
    <div class="wr-panel">
      <h3>Alertas</h3>
      <ul class="wr-alerts">
        ${items.map(it => `
          <li class="wr-alert ${escapeHtml(it.severity)}">
            <strong>${escapeHtml(it.month)}</strong> — ${escapeHtml(it.detail)}
          </li>
        `).join('')}
      </ul>
      <p class="wr-muted">Regras e thresholds em tooltips nos rótulos.</p>
    </div>
  `;
}

function renderNarrative(data) {
  const { kpis, format, cl } = data;
  const gm25 = kpis.realFy25.gm;
  const gm26 = kpis.realFy26Ytd.gm;
  const gmDelta = kpis.deltas.gmPp;

  const fatDev = kpis.deltas.faturamentoPct;
  const gpDev = kpis.deltas.gpPct;
  const pessoalDev = kpis.deltas.pessoalPct;
  const consumoDev = kpis.deltas.consumoPct;

  const paragraphs = [];

  paragraphs.push(
    `Em ${cl.label}, a margem bruta (Gross Profit exc. IFRS16) acumulada saiu de ${format.pct(gm25)} (FY25) para ${format.pct(gm26)} (FY26 YTD), uma variação de ${format.pp(gmDelta)}.`
  );

  paragraphs.push(
    `No recorte FY26 YTD, o Real vs Budget indica variação de ${format.pct(fatDev)} em faturamento e ${format.pct(gpDev)} em Gross Profit. Para custo, os desvios são ${format.pct(pessoalDev)} em pessoal e ${format.pct(consumoDev)} em consumo.`
  );

  const flags = (data.outliers || []).slice(0, 2).map(o => `${o.month}: ${o.title}`);
  if (flags.length) {
    paragraphs.push(
      `Meses que merecem leitura com cuidado: ${flags.join('; ')}. Isso não prova causa, mas aponta onde a narrativa precisa de explicação operacional.`
    );
  } else {
    paragraphs.push(
      `Não houve outliers relevantes pelos thresholds atuais; a leitura sugere estabilidade relativa no período observado.`
    );
  }

  paragraphs.push(
    `Decisão prática: use os alertas e o drill-down para identificar se o desvio está concentrado em poucos meses ou é uma tendência, e então priorize intervenções relacionadas ao tipo de pressão (receita, consumo ou pessoal).`
  );

  return `
    <div class="wr-panel">
      <h3>Leitura (interpretação)</h3>
      ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
    </div>
  `;
}

const RELATED_INTERVENTIONS = {
  BR014545: [
    { id: 'I-01', why: 'Custo e disciplina de consumo em EPI/uniformes' },
    { id: 'I-22', why: 'Manutenção e reparos essenciais como causa de atrito operacional' }
  ],
  BR012302: [
    { id: 'I-01', why: 'Custo e disciplina de consumo em EPI/uniformes' }
  ],
  BR016517: [
    { id: 'I-01', why: 'Custo e disciplina de consumo em EPI/uniformes' }
  ]
};

function renderRelated(clId) {
  const items = RELATED_INTERVENTIONS[clId] || [];
  if (!items.length) {
    return `
      <div class="wr-panel">
        <h3>Intervenções relacionadas</h3>
        <p class="wr-muted">Sem curadoria ainda para este CL.</p>
      </div>
    `;
  }

  return `
    <div class="wr-panel">
      <h3>Intervenções relacionadas</h3>
      <ul class="wr-related">
        ${items.map(it => `
          <li>
            <a href="dossie.html?i=${encodeURIComponent(it.id)}"><strong>${escapeHtml(it.id)}</strong></a>
            <span class="wr-muted">— ${escapeHtml(it.why)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderDrilldownTable(data) {
  const months = data.series.fy26Months;
  const s = data.series.fy26;
  const f = data.format;

  const rows = months.map((m, i) => {
    const fat = s.faturamento[i] || 0;
    const gp = s.gp[i] || 0;
    const gm = s.gmPct[i] || 0;

    const budFat = s.budget.faturamento[i] || 0;
    const budGp = s.budget.gp[i] || 0;

    const devFat = s.deviationsPctByMetric.Faturamento[i] || 0;
    const devGp = s.deviationsPctByMetric.GrossProfit[i] || 0;

    return `
      <tr>
        <td>${escapeHtml(m)}</td>
        <td>${escapeHtml(f.money(fat))}</td>
        <td>${escapeHtml(f.money(gp))}</td>
        <td>${escapeHtml(f.pct(gm))}</td>
        <td>${escapeHtml(f.money(budFat))}</td>
        <td>${escapeHtml(f.money(budGp))}</td>
        <td>${escapeHtml(f.pct(devFat))}</td>
        <td>${escapeHtml(f.pct(devGp))}</td>
      </tr>
    `;
  }).join('');

  return `
    <details class="wr-details" open>
      <summary>Drill-down (FY26 YTD)</summary>
      <div class="wr-table-wrap">
        <table class="wr-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>${tooltip('Faturamento (Real)', 'Faturamento Líquido (Real). No SAP pode vir com sinal negativo; aqui exibimos em módulo.')}</th>
              <th>${tooltip('Gross Profit (Real)', 'Gross Profit exc. IFRS16 (Real). No SAP pode vir com sinal negativo; aqui exibimos em módulo.')}</th>
              <th>${tooltip('GM%', 'Gross Profit / Faturamento. Em %.')}</th>
              <th>Faturamento (Budget)</th>
              <th>Gross Profit (Budget)</th>
              <th>${tooltip('Δ% Fat', '(Real - Budget) / Budget. Thresholds usados em Alertas.')}</th>
              <th>${tooltip('Δ% GP', '(Real - Budget) / Budget. Thresholds usados em Alertas.')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </details>
  `;
}

function renderTopDeviations(data) {
  const months = data.series.fy26Months;

  const topFat = pickTopDeviations(data.series, 'Faturamento', 3);
  const topGp = pickTopDeviations(data.series, 'GrossProfit', 3);

  const list = (label, items) => {
    if (!items.length) return '';
    return `
      <div>
        <h4>${escapeHtml(label)}</h4>
        <ul class="wr-compact">
          ${items.map(it => `
            <li><strong>${escapeHtml(months[it.i])}</strong> — ${(it.v * 100).toFixed(1)}%</li>
          `).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <div class="wr-panel">
      <h3>Deltas que importam (top meses)</h3>
      <div class="wr-grid-2">
        ${list('Faturamento vs Budget', topFat)}
        ${list('Gross Profit vs Budget', topGp)}
      </div>
    </div>
  `;
}

function renderSummary(data) {
  const { kpis, format } = data;

  const cards = [
    renderKpiCard({
      title: 'GM% FY25',
      value: format.pct(kpis.realFy25.gm),
      tooltipText: 'Gross Profit / Faturamento no total FY25.'
    }),
    renderKpiCard({
      title: 'GM% FY26 YTD',
      value: format.pct(kpis.realFy26Ytd.gm),
      subtitle: `Δ ${format.pp(kpis.deltas.gmPp)}`,
      tooltipText: 'Gross Profit / Faturamento no acumulado FY26 YTD (meses disponíveis no Real).'
    }),
    renderKpiCard({
      title: 'Real vs Budget (Fat)',
      value: format.pct(kpis.deltas.faturamentoPct),
      tooltipText: '(Real - Budget) / Budget no acumulado FY26 YTD.'
    }),
    renderKpiCard({
      title: 'Real vs Budget (GP)',
      value: format.pct(kpis.deltas.gpPct),
      tooltipText: '(Real - Budget) / Budget no acumulado FY26 YTD.'
    })
  ].join('');

  return `
    <div class="wr-kpi-grid">
      ${cards}
    </div>
  `;
}

function renderAll(data) {
  return `
    <div class="wr-stack">
      ${renderSummary(data)}
      <div class="wr-grid-2">
        ${renderNarrative(data)}
        ${renderOutliers(data)}
      </div>
      ${renderTopDeviations(data)}
      <div class="wr-grid-2">
        ${renderRelated(data.cl.id)}
        <div class="wr-panel">
          <h3>Metodologia & rastreabilidade</h3>
          <p class="wr-muted">Fonte primária: CSVs SAP Real e Budget. A análise textual é derivada mecanicamente de KPIs e regras de alerta.</p>
          <p><a href="Refined/analise-dados-por-cl.respostas.md">Abrir análise completa (markdown)</a></p>
        </div>
      </div>
      ${renderDrilldownTable(data)}
    </div>
  `;
}

async function init() {
  setupShellInteractions();

  const select = document.getElementById('wr-cl');
  const loading = document.getElementById('wr-data-loading');
  const root = document.getElementById('wr-data-root');

  if (!select || !loading || !root) return;

  Object.values(CL_CONFIG).forEach(cfg => {
    if ([...select.options].some(o => o.value === cfg.id)) return;
    const opt = document.createElement('option');
    opt.value = cfg.id;
    opt.textContent = cfg.label;
    select.appendChild(opt);
  });

  const render = async () => {
    const clId = select.value;
    loading.style.display = 'block';
    root.style.display = 'none';

    try {
      const data = await loadClData(clId);
      root.innerHTML = renderAll(data);
      loading.style.display = 'none';
      root.style.display = 'block';
    } catch (e) {
      loading.classList.remove('loading');
      loading.innerHTML = `<div class="warroom-error"><h2>Erro ao carregar dados</h2><p><code>${escapeHtml(String(e && e.message ? e.message : e))}</code></p></div>`;
    }
  };

  select.addEventListener('change', render);
  await render();
}

document.addEventListener('DOMContentLoaded', init);
