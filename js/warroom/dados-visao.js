import { CL_CONFIG, loadAllCls } from './sap-cl-data.js';

// Glossário didático para tooltips
const GLOSSARY = {
  faturamento: {
    term: 'Faturamento Líquido',
    definition: 'Receita total após descontos e devoluções. É o dinheiro que efetivamente entra do cliente.',
    turnoverContext: 'Faturamento baixo pode indicar operação enxuta demais, com pouca margem para investir em retenção de pessoas.'
  },
  gp: {
    term: 'Gross Profit (Lucro Bruto)',
    definition: 'Receita menos custos diretos (pessoal, consumo, etc). É o que sobra antes das despesas administrativas.',
    turnoverContext: 'GP baixo significa margem apertada para investir em benefícios, treinamento e melhorias de clima — fatores que afetam turnover.'
  },
  gm: {
    term: 'GM% (Margem Bruta)',
    definition: 'Percentual do faturamento que sobra como lucro bruto. GM% = Gross Profit ÷ Faturamento.',
    turnoverContext: 'Operações com GM% abaixo de 10% têm pouca flexibilidade financeira para ações de retenção.'
  },
  pessoal: {
    term: 'Custo de Pessoal',
    definition: 'Todos os gastos com mão de obra: salários, encargos, benefícios, horas extras, etc.',
    turnoverContext: 'Custo de pessoal alto pode indicar sobrecarga de HE ou ineficiência, mas também pode refletir investimento em retenção.'
  },
  consumo: {
    term: 'Consumo',
    definition: 'Gastos com insumos diretos da operação (alimentos, materiais, etc).',
    turnoverContext: 'Consumo fora do budget pode indicar desperdício ou processos despadronizados que sobrecarregam a equipe.'
  },
  budget: {
    term: 'Budget (Orçamento)',
    definition: 'Valor planejado no início do ano fiscal para cada métrica.',
    turnoverContext: 'Desvios do budget sinalizam se a operação está sob controle ou se há problemas estruturais.'
  },
  delta: {
    term: 'Delta (Δ)',
    definition: 'Diferença entre o valor real e o orçado/previsto, em percentual.',
    turnoverContext: 'Deltas muito altos (ex: >100%) geralmente indicam budget subestimado ou mudança drástica de escopo.'
  }
};

// Configuração de contratos (agrupamento lógico)
const CONTRACTS = {
  leroyMerlin: {
    id: 'leroy-merlin',
    name: 'Leroy Merlin',
    subtitle: 'Cajamar',
    icon: '🏪',
    color: 'gold',
    cls: ['BR014545']
  },
  inovatFood: {
    id: 'inovat-food',
    name: 'Inovat',
    subtitle: 'Food',
    icon: '�️',
    color: 'teal',
    cls: ['BR012302']
  },
  inovatFm: {
    id: 'inovat-fm',
    name: 'Inovat',
    subtitle: 'FM',
    icon: '🧰',
    color: 'teal',
    cls: ['BR016517']
  }
};

function fmtMoney(n) {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1e6) return 'R$ ' + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return 'R$ ' + (v / 1e3).toFixed(0) + 'k';
  return 'R$ ' + v.toFixed(0);
}

function fmtPct(n) {
  return (Number(n) * 100).toFixed(1) + '%';
}

function tooltip(key) {
  const g = GLOSSARY[key];
  if (!g) return '';
  return `<span class="wr-tip" data-tooltip="${g.definition} ⚡ ${g.turnoverContext}" aria-label="Ajuda">ⓘ</span>`;
}

let __wrActiveTooltipEl = null;
let __wrActiveTooltipAnchor = null;

function ensureFloatingTooltipEl() {
  if (__wrActiveTooltipEl) return __wrActiveTooltipEl;
  const el = document.createElement('div');
  el.className = 'wr-float-tooltip';
  el.setAttribute('role', 'tooltip');
  el.style.display = 'none';
  document.body.appendChild(el);
  __wrActiveTooltipEl = el;
  return el;
}

function hideFloatingTooltip() {
  if (!__wrActiveTooltipEl) return;
  __wrActiveTooltipEl.style.display = 'none';
  __wrActiveTooltipEl.textContent = '';
  __wrActiveTooltipAnchor = null;
}

function positionFloatingTooltip(anchorEl, tooltipEl) {
  const rect = anchorEl.getBoundingClientRect();
  const margin = 10;
  const maxWidth = Math.min(420, Math.floor(window.innerWidth * 0.9));

  tooltipEl.style.maxWidth = `${maxWidth}px`;
  tooltipEl.style.left = '0px';
  tooltipEl.style.top = '0px';
  tooltipEl.style.transform = 'none';

  const tipRect = tooltipEl.getBoundingClientRect();
  const desiredLeft = rect.left + rect.width / 2 - tipRect.width / 2;
  const left = Math.max(margin, Math.min(desiredLeft, window.innerWidth - tipRect.width - margin));

  // Preferir acima; se estourar, colocar abaixo
  const aboveTop = rect.top - tipRect.height - margin;
  const belowTop = rect.bottom + margin;
  const top = aboveTop >= margin ? aboveTop : (belowTop + tipRect.height + margin <= window.innerHeight ? belowTop : Math.max(margin, Math.min(aboveTop, window.innerHeight - tipRect.height - margin)));

  tooltipEl.style.left = `${Math.round(left)}px`;
  tooltipEl.style.top = `${Math.round(top)}px`;
}

function initTooltips() {
  const tipEl = ensureFloatingTooltipEl();

  function show(anchor) {
    const text = anchor.getAttribute('data-tooltip') || '';
    if (!text) return;
    __wrActiveTooltipAnchor = anchor;
    tipEl.textContent = text;
    tipEl.style.display = 'block';
    positionFloatingTooltip(anchor, tipEl);
  }

  document.addEventListener('mouseenter', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const anchor = t.closest('.wr-tip');
    if (!anchor) return;
    show(anchor);
  }, true);

  document.addEventListener('mouseleave', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const anchor = t.closest('.wr-tip');
    if (!anchor) return;
    hideFloatingTooltip();
  }, true);

  window.addEventListener('scroll', () => {
    if (__wrActiveTooltipAnchor && __wrActiveTooltipEl && __wrActiveTooltipEl.style.display !== 'none') {
      positionFloatingTooltip(__wrActiveTooltipAnchor, __wrActiveTooltipEl);
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (__wrActiveTooltipAnchor && __wrActiveTooltipEl && __wrActiveTooltipEl.style.display !== 'none') {
      positionFloatingTooltip(__wrActiveTooltipAnchor, __wrActiveTooltipEl);
    }
  });
}

function fmtDeltaWithContext(pct, budgetValue, realValue) {
  const absPct = Math.abs(pct * 100);
  let explanation = '';
  
  if (absPct > 100 && budgetValue < 50000) {
    explanation = '(budget muito baixo — variação amplificada)';
  } else if (absPct > 200) {
    explanation = '(mudança de escopo provável)';
  } else if (absPct > 50) {
    explanation = '(desvio significativo)';
  }
  
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${(pct * 100).toFixed(1)}%`;
}

function deltaContextText(pct, budgetValue) {
  const absPct = Math.abs(pct * 100);
  if (absPct > 100 && budgetValue < 50000) {
    return 'Budget muito baixo no período; a variação percentual fica artificialmente enorme.';
  }
  if (absPct > 200) {
    return 'Variação extrema; pode indicar mudança de escopo, reclassificação contábil ou planejamento inadequado.';
  }
  if (absPct > 50) {
    return 'Desvio relevante; vale investigar causas operacionais (volume, preço, horas extras, consumo, etc).';
  }
  return 'Desvio normal de acompanhamento versus budget.';
}

function aggregateByContract(clsData) {
  const result = {};
  
  for (const [key, contract] of Object.entries(CONTRACTS)) {
    const clsInContract = clsData.filter(d => contract.cls.includes(d.cl.id));
    
    const agg = {
      contract,
      faturamento: 0,
      gp: 0,
      pessoal: 0,
      consumo: 0,
      budgetFat: 0,
      budgetGp: 0,
      fy25Fat: 0,
      fy25Gp: 0
    };
    
    clsInContract.forEach(d => {
      agg.faturamento += d.kpis.realFy26Ytd.faturamento;
      agg.gp += d.kpis.realFy26Ytd.gp;
      agg.pessoal += d.kpis.realFy26Ytd.pessoal;
      agg.consumo += d.kpis.realFy26Ytd.consumo;
      agg.budgetFat += d.kpis.budgetFy26Ytd.faturamento;
      agg.budgetGp += d.kpis.budgetFy26Ytd.gp;
      agg.fy25Fat += d.kpis.realFy25.faturamento;
      agg.fy25Gp += d.kpis.realFy25.gp;
    });
    
    agg.gm = agg.faturamento ? agg.gp / agg.faturamento : 0;
    const fy25Gm = agg.fy25Fat ? agg.fy25Gp / agg.fy25Fat : 0;
    agg.gmDelta = agg.gm - fy25Gm;
    agg.gpDeltaPct = agg.budgetGp ? (agg.gp - agg.budgetGp) / agg.budgetGp : 0;
    
    result[key] = agg;
  }

  // Total Inovat = Food + FM
  const food = result.inovatFood;
  const fm = result.inovatFm;
  result.inovatTotal = {
    contract: {
      id: 'inovat-total',
      name: 'Inovat',
      subtitle: 'Total (Food + FM)',
      icon: '🏭',
      color: 'teal'
    },
    faturamento: (food?.faturamento || 0) + (fm?.faturamento || 0),
    gp: (food?.gp || 0) + (fm?.gp || 0),
    pessoal: (food?.pessoal || 0) + (fm?.pessoal || 0),
    consumo: (food?.consumo || 0) + (fm?.consumo || 0),
    budgetFat: (food?.budgetFat || 0) + (fm?.budgetFat || 0),
    budgetGp: (food?.budgetGp || 0) + (fm?.budgetGp || 0),
    fy25Fat: (food?.fy25Fat || 0) + (fm?.fy25Fat || 0),
    fy25Gp: (food?.fy25Gp || 0) + (fm?.fy25Gp || 0)
  };
  result.inovatTotal.gm = result.inovatTotal.faturamento ? result.inovatTotal.gp / result.inovatTotal.faturamento : 0;
  const inovatFy25Gm = result.inovatTotal.fy25Fat ? result.inovatTotal.fy25Gp / result.inovatTotal.fy25Fat : 0;
  result.inovatTotal.gmDelta = result.inovatTotal.gm - inovatFy25Gm;
  result.inovatTotal.gpDeltaPct = result.inovatTotal.budgetGp ? (result.inovatTotal.gp - result.inovatTotal.budgetGp) / result.inovatTotal.budgetGp : 0;

  return result;
}

function renderHero(totals, contractsData) {
  const el = document.getElementById('wr-hero');

  const leroy = contractsData.leroyMerlin;
  const inovatFood = contractsData.inovatFood;
  const inovatFm = contractsData.inovatFm;
  const inovatTotal = contractsData.inovatTotal;

  const renderCard = (data, cssClass) => {
    const deltaLabel = fmtDeltaWithContext(data.gpDeltaPct, data.budgetGp, data.gp);
    const deltaTip = `${deltaContextText(data.gpDeltaPct, data.budgetGp)} Budget GP é a base de comparação.`;
    return `
    <div class="wr-contract-card ${cssClass}">
      <div class="wr-contract-header">
        <span class="wr-contract-icon">${data.contract.icon}</span>
        <div>
          <div class="wr-contract-name">${data.contract.name}</div>
          <div class="wr-contract-sub">${data.contract.subtitle}</div>
        </div>
      </div>
      <div class="wr-contract-kpis">
        <div class="wr-contract-kpi">
          <span class="wr-contract-kpi-label">Faturamento ${tooltip('faturamento')}</span>
          <span class="wr-contract-kpi-value">${fmtMoney(data.faturamento)}</span>
        </div>
        <div class="wr-contract-kpi">
          <span class="wr-contract-kpi-label">GP ${tooltip('gp')}</span>
          <span class="wr-contract-kpi-value">${fmtMoney(data.gp)}</span>
        </div>
        <div class="wr-contract-kpi">
          <span class="wr-contract-kpi-label">GM% ${tooltip('gm')}</span>
          <span class="wr-contract-kpi-value wr-gm ${data.gm < 0.05 ? 'bad' : data.gm > 0.15 ? 'good' : 'mid'}">${fmtPct(data.gm)}</span>
        </div>
        <div class="wr-contract-kpi">
          <span class="wr-contract-kpi-label">Δ GP vs Budget ${tooltip('delta')}</span>
          <span class="wr-contract-kpi-value ${data.gpDeltaPct >= 0 ? 'positive' : 'negative'}">
            ${deltaLabel} <span class="wr-tip" data-tooltip="${deltaTip}">ⓘ</span>
          </span>
        </div>
      </div>
    </div>
  `;
  };

  el.innerHTML = `
    <div class="wr-contracts-grid-2x2">
      ${renderCard(leroy, 'leroy')}
      ${renderCard(inovatTotal, 'inovat inovat-total')}
      ${renderCard(inovatFood, 'inovat inovat-food')}
      ${renderCard(inovatFm, 'inovat inovat-fm')}
    </div>
  `;
}

function renderStats(totals, clsData) {
  const el = document.getElementById('wr-stats');

  const clCards = clsData.map(d => {
    const gm = d.kpis.realFy26Ytd.gm;
    const gmClass = gm < 0.05 ? 'bad' : gm > 0.15 ? 'good' : 'mid';
    const deltaPct = d.kpis.deltas.gpPct;
    const deltaLabel = fmtDeltaWithContext(deltaPct, d.kpis.budgetFy26Ytd.gp, d.kpis.realFy26Ytd.gp);
    const deltaTip = `${deltaContextText(deltaPct, d.kpis.budgetFy26Ytd.gp)} Budget GP é a base de comparação.`;

    return `
      <div class="wr-stat-card">
        <div class="wr-stat-card-top">
          <div class="wr-stat-card-title">${d.cl.shortName}</div>
          <div class="wr-stat-card-chip">${d.cl.id}</div>
        </div>
        <div class="wr-stat-card-metrics">
          <div class="wr-stat-metric">
            <div class="wr-stat-metric-label">Faturamento ${tooltip('faturamento')}</div>
            <div class="wr-stat-metric-value">${fmtMoney(d.kpis.realFy26Ytd.faturamento)}</div>
          </div>
          <div class="wr-stat-metric">
            <div class="wr-stat-metric-label">GP ${tooltip('gp')}</div>
            <div class="wr-stat-metric-value">${fmtMoney(d.kpis.realFy26Ytd.gp)}</div>
          </div>
          <div class="wr-stat-metric">
            <div class="wr-stat-metric-label">GM% ${tooltip('gm')}</div>
            <div class="wr-stat-metric-value"><span class="wr-gm-badge ${gmClass}">${fmtPct(gm)}</span></div>
          </div>
          <div class="wr-stat-metric">
            <div class="wr-stat-metric-label">Δ GP vs Budget ${tooltip('delta')}</div>
            <div class="wr-stat-metric-value ${deltaPct >= 0 ? 'positive' : 'negative'}">${deltaLabel} <span class="wr-tip" data-tooltip="${deltaTip}">ⓘ</span></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = clCards;
}

function renderConsolidated(totals) {
  const el = document.getElementById('wr-consolidated');
  if (!el) return;

  const gpBudgetDelta = totals.gp - totals.budgetGp;
  const gpBudgetPct = totals.budgetGp ? (gpBudgetDelta / totals.budgetGp) : 0;
  const gpClass = gpBudgetPct >= 0 ? 'positive' : 'negative';
  const pessoalPct = totals.faturamento ? totals.pessoal / totals.faturamento : 0;
  const consumoPct = totals.faturamento ? totals.consumo / totals.faturamento : 0;

  el.innerHTML = `
    <details class="wr-details">
      <summary>Ver consolidado (soma dos 3 CLs) — FY26 YTD</summary>
      <div class="wr-stat-grid" style="margin-top: 12px;">
        <div class="wr-stat-card">
          <div class="wr-stat-card-icon teal">💰</div>
          <div class="wr-stat-card-label">Gross Profit Consolidado ${tooltip('gp')}</div>
          <div class="wr-stat-card-value">${fmtMoney(totals.gp)}</div>
          <div class="wr-stat-card-delta ${gpClass}">${fmtDeltaWithContext(gpBudgetPct, totals.budgetGp, totals.gp)} vs Budget</div>
        </div>
        <div class="wr-stat-card">
          <div class="wr-stat-card-icon gold">📊</div>
          <div class="wr-stat-card-label">GM% Médio ${tooltip('gm')}</div>
          <div class="wr-stat-card-value">${fmtPct(totals.gm)}</div>
          <div class="wr-stat-card-delta ${totals.gmDelta >= 0 ? 'positive' : 'negative'}">${totals.gmDelta >= 0 ? '↑' : '↓'} ${fmtPct(Math.abs(totals.gmDelta))} vs FY25</div>
        </div>
        <div class="wr-stat-card">
          <div class="wr-stat-card-icon purple">👥</div>
          <div class="wr-stat-card-label">Custo de Pessoal ${tooltip('pessoal')}</div>
          <div class="wr-stat-card-value">${fmtMoney(totals.pessoal)}</div>
          <div class="wr-stat-card-delta neutral">${fmtPct(pessoalPct)} do Faturamento</div>
        </div>
        <div class="wr-stat-card">
          <div class="wr-stat-card-icon warning">🍽️</div>
          <div class="wr-stat-card-label">Consumo ${tooltip('consumo')}</div>
          <div class="wr-stat-card-value">${fmtMoney(totals.consumo)}</div>
          <div class="wr-stat-card-delta neutral">${fmtPct(consumoPct)} do Faturamento</div>
        </div>
      </div>
    </details>
  `;
}

function renderClTable(clsData) {
  const el = document.getElementById('wr-cl-table');
  
  const rows = clsData.map(d => {
    const gmClass = d.kpis.realFy26Ytd.gm < 0.05 ? 'bad' : d.kpis.realFy26Ytd.gm > 0.15 ? 'good' : 'mid';
    const deltaClass = d.kpis.deltas.gpPct >= 0 ? 'positive' : 'negative';
    const deltaExplanation = fmtDeltaWithContext(d.kpis.deltas.gpPct, d.kpis.budgetFy26Ytd.gp, d.kpis.realFy26Ytd.gp);
    
    // Identifica qual contrato
    const isLeroy = d.cl.id === 'BR014545';
    const isInovatFood = d.cl.id === 'BR012302';
    const isInovatFm = d.cl.id === 'BR016517';
    const contractBadge = isLeroy
      ? '<span class="wr-contract-badge leroy">Leroy</span>'
      : isInovatFood
        ? '<span class="wr-contract-badge inovat">Inovat · Food</span>'
        : isInovatFm
          ? '<span class="wr-contract-badge inovat">Inovat · FM</span>'
          : '<span class="wr-contract-badge inovat">Inovat</span>';
    
    return `
      <tr>
        <td>
          <a href="warroom-dados-cl.html?cl=${d.cl.id}">${d.cl.shortName}</a>
          ${contractBadge}
        </td>
        <td class="wr-num">${fmtMoney(d.kpis.realFy26Ytd.faturamento)}</td>
        <td class="wr-num">${fmtMoney(d.kpis.realFy26Ytd.gp)}</td>
        <td class="wr-num wr-heat ${gmClass}">${fmtPct(d.kpis.realFy26Ytd.gm)}</td>
        <td class="wr-num wr-delta-cell ${deltaClass}" title="${deltaExplanation}">${deltaExplanation}</td>
        <td class="wr-num">${fmtMoney(d.kpis.realFy26Ytd.pessoal)}</td>
        <td class="wr-num">${fmtMoney(d.kpis.realFy26Ytd.consumo)}</td>
      </tr>
    `;
  }).join('');
  
  el.innerHTML = `
    <div class="wr-table-wrap">
      <table class="wr-drill-table">
        <thead>
          <tr>
            <th style="min-width: 140px;">Centro de Custo</th>
            <th class="wr-th-num">Faturamento ${tooltip('faturamento')}</th>
            <th class="wr-th-num">Gross Profit ${tooltip('gp')}</th>
            <th class="wr-th-num">GM% ${tooltip('gm')}</th>
            <th class="wr-th-num">Δ GP vs Budget ${tooltip('delta')}</th>
            <th class="wr-th-num">Pessoal ${tooltip('pessoal')}</th>
            <th class="wr-th-num">Consumo ${tooltip('consumo')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderAlerts(clsData) {
  const el = document.getElementById('wr-alerts');
  
  const allAlerts = [];
  clsData.forEach(d => {
    d.outliers.slice(0, 3).forEach(o => {
      allAlerts.push({
        cl: d.cl.shortName,
        clId: d.cl.id,
        ...o
      });
    });
  });
  
  if (allAlerts.length === 0) {
    el.innerHTML = `
      <div class="wr-insight-card success">
        <div class="wr-insight-card-header">
          <span class="wr-insight-card-icon">✅</span>
          <h4 class="wr-insight-card-title">Sem alertas críticos</h4>
        </div>
        <div class="wr-insight-card-body">
          Nenhum desvio significativo identificado no período atual.
        </div>
      </div>
    `;
    return;
  }
  
  const alertsHtml = allAlerts.slice(0, 6).map(a => {
    const cardClass = a.severity === 'danger' ? 'danger' : 'warning';
    const icon = a.severity === 'danger' ? '🚨' : '⚠️';
    
    return `
      <div class="wr-insight-card ${cardClass}">
        <div class="wr-insight-card-header">
          <span class="wr-insight-card-icon">${icon}</span>
          <h4 class="wr-insight-card-title">${a.cl}: ${a.title}</h4>
        </div>
        <div class="wr-insight-card-body">
          ${a.detail}
          <br><a href="warroom-dados-cl.html?cl=${a.clId}">Ver detalhes →</a>
        </div>
      </div>
    `;
  }).join('');
  
  el.innerHTML = alertsHtml;
}

async function init() {
  try {
    initTooltips();
    const clsData = await loadAllCls();
    
    const totals = {
      faturamento: 0,
      gp: 0,
      pessoal: 0,
      consumo: 0,
      budgetFat: 0,
      budgetGp: 0,
      fy25Fat: 0,
      fy25Gp: 0
    };
    
    clsData.forEach(d => {
      totals.faturamento += d.kpis.realFy26Ytd.faturamento;
      totals.gp += d.kpis.realFy26Ytd.gp;
      totals.pessoal += d.kpis.realFy26Ytd.pessoal;
      totals.consumo += d.kpis.realFy26Ytd.consumo;
      totals.budgetFat += d.kpis.budgetFy26Ytd.faturamento;
      totals.budgetGp += d.kpis.budgetFy26Ytd.gp;
      totals.fy25Fat += d.kpis.realFy25.faturamento;
      totals.fy25Gp += d.kpis.realFy25.gp;
    });
    
    totals.gm = totals.faturamento ? totals.gp / totals.faturamento : 0;
    const fy25Gm = totals.fy25Fat ? totals.fy25Gp / totals.fy25Fat : 0;
    totals.gmDelta = totals.gm - fy25Gm;
    
    document.getElementById('wr-loading').style.display = 'none';
    document.getElementById('wr-content').style.display = 'block';
    
    const contractsData = aggregateByContract(clsData);
    
    renderHero(totals, contractsData);
    renderStats(totals, clsData);
    renderConsolidated(totals);
    renderClTable(clsData);
    renderAlerts(clsData);
    
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('wr-loading').innerHTML = `
      <div class="wr-empty-state">
        <div class="wr-empty-state-icon">❌</div>
        <h3 class="wr-empty-state-title">Erro ao carregar dados</h3>
        <p class="wr-empty-state-text">${err.message}</p>
      </div>
    `;
  }
}

init();
