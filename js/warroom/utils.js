/**
 * War Room - Utils
 */

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url}: ${response.status}`);
  }
  return response.text();
}

function parseFrontmatter(markdown) {
  const src = String(markdown || '');
  const trimmed = src.replace(/^\uFEFF/, '');

  if (!trimmed.startsWith('---\n') && !trimmed.startsWith('---\r\n')) {
    return { frontmatter: {}, content: src };
  }

  const endIdx = trimmed.indexOf('\n---', 3);
  if (endIdx === -1) {
    return { frontmatter: {}, content: src };
  }

  const yamlBlock = trimmed.slice(4, endIdx + 1);
  const content = trimmed.slice(endIdx + 5).replace(/^\r?\n/, '');
  return { frontmatter: parseYamlSimple(yamlBlock), content };
}

function parseYamlSimple(yamlText) {
  const lines = String(yamlText || '').split(/\r?\n/);
  const result = {};

  let currentKey = null;
  let currentList = null;

  const commitList = () => {
    if (currentKey && currentList) {
      result[currentKey] = currentList;
    }
    currentKey = null;
    currentList = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!currentList) currentList = [];
      currentList.push(listMatch[1].trim());
      continue;
    }

    const kv = line.match(/^\s*([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;

    commitList();

    const key = kv[1];
    const valueRaw = kv[2].trim();

    if (!valueRaw) {
      currentKey = key;
      currentList = [];
      continue;
    }

    const inlineList = valueRaw.match(/^\[(.*)\]$/);
    if (inlineList) {
      const inside = inlineList[1].trim();
      if (!inside) {
        result[key] = [];
      } else {
        result[key] = inside.split(',').map(s => s.trim()).filter(Boolean);
      }
      continue;
    }

    result[key] = stripYamlQuotes(valueRaw);
  }

  commitList();
  return result;
}

function stripYamlQuotes(value) {
  const v = String(value || '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function getKanbanStatus(kanbanState, cardId) {
  if (!kanbanState || !cardId) return 'backlog';

  const state = kanbanState[cardId];
  if (!state) return 'backlog';

  if (typeof state === 'string') return state;
  if (typeof state === 'object' && state.status) return state.status;

  return 'backlog';
}

function normalizeStatusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'doing') return 'Em andamento';
  if (s === 'blocked') return 'Bloqueado';
  if (s === 'done') return 'Concluído';
  return 'Backlog';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export {
  fetchText,
  parseFrontmatter,
  parseYamlSimple,
  getKanbanStatus,
  normalizeStatusLabel,
  escapeHtml
};
