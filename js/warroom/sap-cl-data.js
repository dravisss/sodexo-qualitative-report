import { fetchText } from './utils.js';

const CL_CONFIG = {
  BR014545: {
    id: 'BR014545',
    label: 'BR014545 — Leroy Merlin Cajamar',
    shortName: 'Cajamar',
    realPath: './evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR014545_LEROY_MERLIN_CAJAMAR.csv',
    budgetPath: './evidencias/blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR014545_LEROY_MERLIN_CAJAMAR.csv'
  },
  BR012302: {
    id: 'BR012302',
    label: 'BR012302 — INOVAT (GRU Food)',
    shortName: 'GRU Food',
    realPath: './evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR012302_INOVAT.csv',
    budgetPath: './evidencias/blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR012302_INOVAT.csv'
  },
  BR016517: {
    id: 'BR016517',
    label: 'BR016517 — INOVAT SP FM SOFT (GRU FM)',
    shortName: 'GRU FM',
    realPath: './evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/BR016517_INOVAT_SP_SOFT_-_FM.csv',
    budgetPath: './evidencias/blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/BR016517_INOVAT_SP_SOFT_-_FM.csv'
  }
};

const METRIC_PATTERNS = {
  faturamento: 'Faturamento Líquido',
  consumo: 'Consumo',
  pessoal: 'Pessoal',
  gp: 'Gross Profit Exc. IFRS16'
};

function toNumber(raw) {
  const s = String(raw ?? '').trim().replace(/\./g, '').replace(',', '.');
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function abs(n) {
  return Math.abs(Number(n || 0));
}

function parseCsvRows(text) {
  const lines = String(text || '').split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map(line => line.split(','));
}

function findRowBySubstring(rows, pattern, labelColIndex) {
  for (let i = 0; i < rows.length; i++) {
    const label = String(rows[i][labelColIndex] ?? '').trim();
    if (label.includes(pattern)) return { index: i, row: rows[i] };
  }
  return null;
}

function detectRealLayout(rows) {
  const headerRow = rows[1];
  let labelColIndex = 0;
  let fy25StartCol = 1;
  
  if (String(headerRow[0] ?? '').trim() === '' || String(headerRow[0] ?? '').includes('Unnamed')) {
    const firstNonEmpty = headerRow.findIndex((c, i) => i > 0 && String(c).includes('Classe'));
    if (firstNonEmpty > 0) {
      labelColIndex = firstNonEmpty;
      fy25StartCol = firstNonEmpty + 1;
    } else {
      labelColIndex = 1;
      fy25StartCol = 2;
    }
  }
  
  const fy25MonthCols = [];
  let fy25TotalCol = -1;
  let fy26LabelCol = -1;
  let fy26StartCol = -1;
  let fy26TotalCol = -1;
  
  for (let c = fy25StartCol; c < headerRow.length; c++) {
    const cell = String(headerRow[c] ?? '').trim();
    if (cell.match(/^(Set|Out|Nov|Dez|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago)\/\d{2}$/)) {
      if (fy26StartCol === -1) {
        fy25MonthCols.push(c);
      }
    } else if (cell === 'Total Exer') {
      if (fy26StartCol === -1) {
        fy25TotalCol = c;
      } else {
        fy26TotalCol = c;
      }
    } else if (cell.includes('Classe') && fy25TotalCol !== -1) {
      fy26LabelCol = c;
      fy26StartCol = c + 1;
    }
  }
  
  const fy26MonthCols = [];
  if (fy26StartCol !== -1) {
    for (let c = fy26StartCol; c < headerRow.length; c++) {
      const cell = String(headerRow[c] ?? '').trim();
      if (cell.match(/^(Set|Out|Nov|Dez|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago)\/\d{2}$/)) {
        fy26MonthCols.push(c);
      } else if (cell === 'Total Exer') {
        fy26TotalCol = c;
        break;
      }
    }
  }

  return {
    labelColIndex,
    fy25: {
      monthCols: fy25MonthCols,
      months: fy25MonthCols.map(c => String(headerRow[c]).trim()),
      totalCol: fy25TotalCol
    },
    fy26: {
      labelCol: fy26LabelCol,
      monthCols: fy26MonthCols,
      months: fy26MonthCols.map(c => String(headerRow[c]).trim()),
      totalCol: fy26TotalCol
    }
  };
}

function detectBudgetLayout(rows) {
  const headerRow = rows[1];
  const labelColIndex = 0;
  
  const fy25MonthCols = [];
  let fy25TotalCol = -1;
  let fy26StartCol = -1;
  const fy26MonthCols = [];
  
  for (let c = 1; c < headerRow.length; c++) {
    const cell = String(headerRow[c] ?? '').trim();
    if (cell.match(/^(Set|Out|Nov|Dez|Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago)\/\d{2}$/)) {
      if (fy26StartCol === -1) {
        fy25MonthCols.push(c);
      } else {
        fy26MonthCols.push(c);
      }
    } else if (cell === 'Total Exer') {
      fy25TotalCol = c;
      fy26StartCol = c + 1;
    }
  }

  return {
    labelColIndex,
    fy25: {
      monthCols: fy25MonthCols,
      months: fy25MonthCols.map(c => String(headerRow[c]).trim()),
      totalCol: fy25TotalCol
    },
    fy26: {
      monthCols: fy26MonthCols,
      months: fy26MonthCols.map(c => String(headerRow[c]).trim())
    }
  };
}

function extractMetricSeriesFromReal(rows, pattern) {
  const layout = detectRealLayout(rows);
  const found = findRowBySubstring(rows, pattern, layout.labelColIndex);
  if (!found) {
    const foundFy26 = layout.fy26.labelCol !== -1 
      ? findRowBySubstring(rows, pattern, layout.fy26.labelCol)
      : null;
    if (!foundFy26) return null;
  }
  
  let fy25Row = null;
  let fy26Row = null;
  
  for (let i = 0; i < rows.length; i++) {
    const fy25Label = String(rows[i][layout.labelColIndex] ?? '').trim();
    if (fy25Label.includes(pattern)) {
      fy25Row = rows[i];
    }
    if (layout.fy26.labelCol !== -1) {
      const fy26Label = String(rows[i][layout.fy26.labelCol] ?? '').trim();
      if (fy26Label.includes(pattern)) {
        fy26Row = rows[i];
      }
    }
  }

  const fy25Values = layout.fy25.monthCols.map(c => toNumber(fy25Row ? fy25Row[c] : 0));
  const fy25Total = fy25Row && layout.fy25.totalCol !== -1 ? toNumber(fy25Row[layout.fy25.totalCol]) : 0;

  const fy26Values = layout.fy26.monthCols.map(c => toNumber(fy26Row ? fy26Row[c] : 0));
  const fy26Total = fy26Row && layout.fy26.totalCol !== -1 ? toNumber(fy26Row[layout.fy26.totalCol]) : 0;

  return {
    fy25: { months: [...layout.fy25.months], values: fy25Values, total: fy25Total },
    fy26: { months: [...layout.fy26.months], values: fy26Values, total: fy26Total }
  };
}

function extractMetricSeriesFromBudget(rows, pattern) {
  const layout = detectBudgetLayout(rows);
  const found = findRowBySubstring(rows, pattern, layout.labelColIndex);
  if (!found) return null;

  const r = found.row;
  const fy25Values = layout.fy25.monthCols.map(c => toNumber(r[c]));
  const fy25Total = layout.fy25.totalCol !== -1 ? toNumber(r[layout.fy25.totalCol]) : 0;
  const fy26Values = layout.fy26.monthCols.map(c => toNumber(r[c]));

  return {
    fy25: { months: [...layout.fy25.months], values: fy25Values, total: fy25Total },
    fy26: { months: [...layout.fy26.months], values: fy26Values }
  };
}

function sum(values) {
  return (values || []).reduce((acc, v) => acc + (Number(v) || 0), 0);
}

function safeDiv(a, b) {
  const den = Number(b) || 0;
  if (!den) return 0;
  return (Number(a) || 0) / den;
}

function fmtMoneyBRL(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function fmtPct(n) {
  const v = Number(n) || 0;
  return (v * 100).toFixed(1) + '%';
}

function fmtPp(n) {
  const v = Number(n) || 0;
  return (v * 100).toFixed(1) + ' pp';
}

function buildOutliers({ realFy26Months, gmPctByMonth, deviationsPctByMetric }) {
  const outliers = [];

  gmPctByMonth.forEach((gm, idx) => {
    if (gm > 0.4) {
      outliers.push({
        kind: 'gm',
        month: realFy26Months[idx],
        severity: 'warn',
        title: 'GM% muito alta',
        detail: `GM% acima de 40% em ${realFy26Months[idx]}`
      });
    }
    if (gm < 0) {
      outliers.push({
        kind: 'gm',
        month: realFy26Months[idx],
        severity: 'warn',
        title: 'GM% negativa',
        detail: `GM% abaixo de 0% em ${realFy26Months[idx]}`
      });
    }
  });

  Object.entries(deviationsPctByMetric || {}).forEach(([metric, devs]) => {
    devs.forEach((d, idx) => {
      const absd = Math.abs(d);
      if (absd >= 0.1) {
        outliers.push({
          kind: 'budget',
          month: realFy26Months[idx],
          severity: absd >= 0.2 ? 'danger' : 'warn',
          title: 'Desvio vs Budget',
          detail: `${metric}: ${(d * 100).toFixed(1)}% em ${realFy26Months[idx]}`
        });
      }
    });
  });

  return outliers;
}

function sliceBudgetToRealMonths(budgetMonths, budgetValues, realMonths) {
  const map = new Map(budgetMonths.map((m, i) => [m, i]));
  return realMonths.map(m => {
    const idx = map.get(m);
    return idx === undefined ? 0 : (budgetValues[idx] ?? 0);
  });
}

async function loadClData(clId) {
  const cfg = CL_CONFIG[clId];
  if (!cfg) throw new Error(`CL inválido: ${clId}`);

  const [realText, budgetText] = await Promise.all([
    fetchText(cfg.realPath),
    fetchText(cfg.budgetPath)
  ]);

  const realRows = parseCsvRows(realText);
  const budgetRows = parseCsvRows(budgetText);

  const real = {};
  const budget = {};

  for (const [key, pattern] of Object.entries(METRIC_PATTERNS)) {
    const r = extractMetricSeriesFromReal(realRows, pattern);
    const b = extractMetricSeriesFromBudget(budgetRows, pattern);
    if (!r) throw new Error(`Não encontrei métrica no Real: ${pattern} (${cfg.id})`);
    if (!b) throw new Error(`Não encontrei métrica no Budget: ${pattern} (${cfg.id})`);
    real[key] = r;
    budget[key] = b;
  }

  const realFy26Months = real.faturamento.fy26.months;

  const realFy25Fat = abs(real.faturamento.fy25.total);
  const realFy25Gp = abs(real.gp.fy25.total);
  const realFy26Fat = abs(real.faturamento.fy26.total);
  const realFy26Gp = abs(real.gp.fy26.total);

  const gmFy25 = safeDiv(realFy25Gp, realFy25Fat);
  const gmFy26 = safeDiv(realFy26Gp, realFy26Fat);

  const budgetFy26FatSeries = sliceBudgetToRealMonths(budget.faturamento.fy26.months, budget.faturamento.fy26.values, realFy26Months);
  const budgetFy26GpSeries = sliceBudgetToRealMonths(budget.gp.fy26.months, budget.gp.fy26.values, realFy26Months);
  const budgetFy26PessoalSeries = sliceBudgetToRealMonths(budget.pessoal.fy26.months, budget.pessoal.fy26.values, realFy26Months);
  const budgetFy26ConsumoSeries = sliceBudgetToRealMonths(budget.consumo.fy26.months, budget.consumo.fy26.values, realFy26Months);

  const budgetFy26Fat = abs(sum(budgetFy26FatSeries));
  const budgetFy26Gp = abs(sum(budgetFy26GpSeries));
  const budgetFy26Pessoal = abs(sum(budgetFy26PessoalSeries));
  const budgetFy26Consumo = abs(sum(budgetFy26ConsumoSeries));

  const realFy26FatSeries = real.faturamento.fy26.values.map(abs);
  const realFy26GpSeries = real.gp.fy26.values.map(abs);
  const realFy26PessoalSeries = real.pessoal.fy26.values.map(abs);
  const realFy26ConsumoSeries = real.consumo.fy26.values.map(abs);

  const deviationsPctByMetric = {
    Faturamento: realFy26FatSeries.map((v, i) => safeDiv(v - abs(budgetFy26FatSeries[i]), abs(budgetFy26FatSeries[i]))),
    GrossProfit: realFy26GpSeries.map((v, i) => safeDiv(v - abs(budgetFy26GpSeries[i]), abs(budgetFy26GpSeries[i]))),
    Pessoal: realFy26PessoalSeries.map((v, i) => safeDiv(v - abs(budgetFy26PessoalSeries[i]), abs(budgetFy26PessoalSeries[i]))),
    Consumo: realFy26ConsumoSeries.map((v, i) => safeDiv(v - abs(budgetFy26ConsumoSeries[i]), abs(budgetFy26ConsumoSeries[i])))
  };

  const gmPctByMonth = realFy26Months.map((_, i) => safeDiv(realFy26GpSeries[i], realFy26FatSeries[i]));

  const outliers = buildOutliers({
    realFy26Months,
    gmPctByMonth,
    deviationsPctByMetric
  });

  return {
    cl: cfg,
    real,
    budget,
    kpis: {
      realFy25: {
        faturamento: realFy25Fat,
        gp: realFy25Gp,
        gm: gmFy25
      },
      realFy26Ytd: {
        faturamento: realFy26Fat,
        gp: realFy26Gp,
        gm: gmFy26,
        pessoal: abs(real.pessoal.fy26.total),
        consumo: abs(real.consumo.fy26.total)
      },
      budgetFy26Ytd: {
        faturamento: budgetFy26Fat,
        gp: budgetFy26Gp,
        pessoal: budgetFy26Pessoal,
        consumo: budgetFy26Consumo
      },
      deltas: {
        gmPp: gmFy26 - gmFy25,
        faturamentoPct: safeDiv(realFy26Fat - budgetFy26Fat, budgetFy26Fat),
        gpPct: safeDiv(realFy26Gp - budgetFy26Gp, budgetFy26Gp),
        pessoalPct: safeDiv(abs(real.pessoal.fy26.total) - budgetFy26Pessoal, budgetFy26Pessoal),
        consumoPct: safeDiv(abs(real.consumo.fy26.total) - budgetFy26Consumo, budgetFy26Consumo)
      }
    },
    series: {
      fy26Months: realFy26Months,
      fy26: {
        faturamento: realFy26FatSeries,
        gp: realFy26GpSeries,
        pessoal: realFy26PessoalSeries,
        consumo: realFy26ConsumoSeries,
        gmPct: gmPctByMonth,
        budget: {
          faturamento: budgetFy26FatSeries.map(abs),
          gp: budgetFy26GpSeries.map(abs),
          pessoal: budgetFy26PessoalSeries.map(abs),
          consumo: budgetFy26ConsumoSeries.map(abs)
        },
        deviationsPctByMetric
      }
    },
    outliers,
    format: {
      money: fmtMoneyBRL,
      pct: fmtPct,
      pp: fmtPp
    }
  };
}

async function loadAllCls() {
  const ids = Object.keys(CL_CONFIG);
  const results = await Promise.all(ids.map(id => loadClData(id)));
  return results;
}

export { CL_CONFIG, loadClData, loadAllCls };
