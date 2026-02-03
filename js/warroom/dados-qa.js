import { fetchText } from './utils.js';

const CATEGORY_CLASSES = {
  A: 'economia',
  B: 'folha',
  C: 'salarios',
  D: 'servicos',
  E: 'alto-valor',
  F: 'derivadas',
  G: 'derivadas'
};

const STATUS_LABELS = {
  answered: '✅ Respondida',
  partial: '🟡 Parcial',
  pending: '⬜ Pendente'
};

let questionsData = null;

async function loadQuestions() {
  const text = await fetchText('./data/questions-index.json');
  return JSON.parse(text);
}

function renderSummary(questions) {
  const el = document.getElementById('wr-summary');
  
  const answered = questions.filter(q => q.status === 'answered').length;
  const partial = questions.filter(q => q.status === 'partial').length;
  const pending = questions.filter(q => q.status === 'pending').length;
  const total = questions.length;
  
  el.innerHTML = `
    <div class="wr-stat-card">
      <div class="wr-stat-card-icon success">✅</div>
      <div class="wr-stat-card-label">Respondidas</div>
      <div class="wr-stat-card-value">${answered}</div>
      <div class="wr-stat-card-delta neutral">${((answered/total)*100).toFixed(0)}% do total</div>
    </div>
    <div class="wr-stat-card">
      <div class="wr-stat-card-icon warning">🟡</div>
      <div class="wr-stat-card-label">Parciais</div>
      <div class="wr-stat-card-value">${partial}</div>
      <div class="wr-stat-card-delta neutral">Precisam complemento</div>
    </div>
    <div class="wr-stat-card">
      <div class="wr-stat-card-icon teal">⬜</div>
      <div class="wr-stat-card-label">Pendentes</div>
      <div class="wr-stat-card-value">${pending}</div>
      <div class="wr-stat-card-delta neutral">Aguardando análise</div>
    </div>
    <div class="wr-stat-card">
      <div class="wr-stat-card-icon purple">📋</div>
      <div class="wr-stat-card-label">Total</div>
      <div class="wr-stat-card-value">${total}</div>
      <div class="wr-stat-card-delta neutral">Perguntas mapeadas</div>
    </div>
  `;
}

function renderQuestionsList(questions, categories) {
  const el = document.getElementById('wr-qa-list');
  
  if (questions.length === 0) {
    el.innerHTML = `
      <div class="wr-empty-state">
        <div class="wr-empty-state-icon">🔍</div>
        <h3 class="wr-empty-state-title">Nenhuma pergunta encontrada</h3>
        <p class="wr-empty-state-text">Tente ajustar os filtros.</p>
      </div>
    `;
    return;
  }
  
  const catMap = new Map(categories.map(c => [c.id, c]));
  
  const html = questions.map(q => {
    const cat = catMap.get(q.category) || { name: q.category, icon: '📌' };
    const catClass = CATEGORY_CLASSES[q.category] || '';
    const statusLabel = STATUS_LABELS[q.status] || q.status;
    
    const summaryHtml = q.answerSummary 
      ? `<p class="wr-qa-item-summary">${q.answerSummary}</p>` 
      : '';
    
    const interventionsHtml = q.interventions && q.interventions.length > 0
      ? `<span class="wr-cat-badge">${q.interventions.join(', ')}</span>`
      : '';
    
    return `
      <div class="wr-qa-item" data-id="${q.id}" data-link="${q.drilldownLink || ''}">
        <div class="wr-qa-item-header">
          <span class="wr-qa-item-id">${q.id}</span>
          <span class="wr-qa-item-status ${q.status}">${statusLabel}</span>
        </div>
        <h3 class="wr-qa-item-title">${q.title}</h3>
        ${summaryHtml}
        <div class="wr-qa-item-meta">
          <span class="wr-cat-badge ${catClass}">${cat.icon} ${cat.name}</span>
          ${interventionsHtml}
        </div>
      </div>
    `;
  }).join('');
  
  el.innerHTML = html;
  
  el.querySelectorAll('.wr-qa-item').forEach(item => {
    item.addEventListener('click', () => {
      const link = item.dataset.link;
      if (link) window.location.href = link;
    });
  });
}

function applyFilters() {
  if (!questionsData) return;
  
  const catFilter = document.getElementById('cat-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  
  let filtered = questionsData.questions;
  
  if (catFilter) {
    filtered = filtered.filter(q => q.category === catFilter);
  }
  
  if (statusFilter) {
    filtered = filtered.filter(q => q.status === statusFilter);
  }
  
  renderQuestionsList(filtered, questionsData.categories);
}

async function init() {
  try {
    questionsData = await loadQuestions();
    
    document.getElementById('wr-loading').style.display = 'none';
    document.getElementById('wr-qa-list').style.display = 'flex';
    
    renderSummary(questionsData.questions);
    renderQuestionsList(questionsData.questions, questionsData.categories);
    
    document.getElementById('cat-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    
  } catch (err) {
    console.error('Erro ao carregar perguntas:', err);
    document.getElementById('wr-loading').innerHTML = `
      <div class="wr-empty-state">
        <div class="wr-empty-state-icon">❌</div>
        <h3 class="wr-empty-state-title">Erro ao carregar perguntas</h3>
        <p class="wr-empty-state-text">${err.message}</p>
      </div>
    `;
  }
}

init();
