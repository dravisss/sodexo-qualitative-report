# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Single Page Application for reading qualitative reports on systemic tensions and intervention plans. Fetches Markdown files and renders them as interactive articles with forms, kanban boards, timelines, and dashboards.

- **Stack:** Vanilla JavaScript (ES Modules), HTML5, CSS3 — no build step or bundler.
- **Backend:** Netlify Functions (Node.js/ESM) + PostgreSQL (Neon) + Netlify Blobs.
- **Content:** Markdown files in `Refined/` and `Intervencoes/`.
- **Deployment:** Netlify (static site + serverless functions).

## Development Commands

```bash
npm install                    # Install dependencies (for Netlify Functions)
npx serve .                    # Frontend only (or python3 -m http.server 8000)
netlify dev                    # Full app with Functions emulation (requires Netlify CLI)
```

No automated test suite. Manual testing against rendered Markdown articles and interactive components.

## Architecture

### Frontend Core

| File | Role |
|------|------|
| `index.html` | Entry point; auth gate via sessionStorage, loads `js/app.js` |
| `kanban.html` | Intervention management board (separate page) |
| `js/app.js` | `ReportReader` class — routing, Markdown fetch/parse, article rendering |
| `js/config.js` | Article manifest (`ARTICLES` array) and navigation group definitions |
| `js/autosave.js` | `AutoSaveManager` — debounced saves, localStorage cache, cloud sync |
| `js/kanban.js` | `KanbanManager` — drag-drop board with SortableJS, Blob-backed state |
| `js/dashboard.js` | `RoteiroParser` — parses form structure from Markdown, renders answer dashboards |
| `js/login.js` | Simple auth gate; sets `sessionStorage.sin_authenticated` |

### Routing

Hash-based: `index.html#01`, `index.html#08`, etc. Article IDs map to paths in `js/config.js`. Navigation groups: Visão Geral, Artigos, Evidências, Memória, Campo, Ferramentas.

### Article-Specific Rendering Pipeline

This is the core architectural pattern. After Markdown is parsed with `marked.js`, `processArticleContent()` in `app.js` applies article-type-specific transformations:

- **Articles 01-04, 07, 11-14** — Header/bold-text patterns converted to collapsible "intervention cards" with emoji-icon mapping (e.g., "Tensão" → 📍, "Objetivo" → 🎯).
- **Article 05** (Dossiês) — H2 sections become tabbed case-file panes via `setupCaseFilesTabs()`.
- **Article 08** (Intervenções) — War Room dashboard with matrix spotlights via `renderWarRoom()`.
- **Article 09** (Histórico) — Timeline visualization via `renderTimeline()`.
- **Article 10** (Lab Archive) — Archive rendering via `renderLabArchive()`.
- **Article 15** (Roteiro) — Interactive form: Markdown tables with "?" cells become input fields, nested tab structure, file attachments, real-time autosave. Rendered via `renderInvestigationForm()`.

### Custom Markdown Extensions

- **GitHub-style alerts:** `> [!NOTE]`, `> [!WARNING]`, `> [!IMPORTANT]`, `> [!TIP]`, `> [!CAUTION]` — rendered as `.callout` divs with icons.
- **Intervention cards:** Pattern-based extraction from H2/H3 + bold labels.

### State Management

| Key | Storage | Purpose |
|-----|---------|---------|
| `investigation_form_data` | localStorage | Form answers (JSON) |
| `investigation_form_meta` | localStorage | Submission ID, unit, sync timestamp |
| `sidebar-collapsed` | localStorage | Sidebar open/closed state |
| `sidebar-open-groups` | localStorage | Navigation group toggle states |
| `sin_authenticated` | sessionStorage | Auth flag |

**Sync flow:** User input → `AutoSaveManager.saveAnswer()` → 2s debounce → POST `/api/sync-submissions` → PostgreSQL. File uploads go to Netlify Blobs via `/api/upload-blob`. On page load, `fetchLatestForUnit()` pulls cloud data back.

**Unified Form Mode:** All submissions route to a single "general" unit slug regardless of URL params.

### Backend API (`netlify/functions/`)

All functions are Node.js ESM (`.mjs`). API routes are mapped via `netlify.toml` redirects: `/api/*` → `/.netlify/functions/:splat`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sync-submissions` | POST | Upsert form submissions (JSONB answers to PostgreSQL) |
| `/api/get-submission` | GET | Fetch submission by `?id=UUID` or `?unit=slug` |
| `/api/list-submissions` | GET | Paginated submission list |
| `/api/export-submission` | GET | Export submission as JSON |
| `/api/upload-blob` | POST | File upload to Netlify Blobs (`evidence-files` store) |
| `/api/download-blob` | GET | Stream file back by `?key=` |
| `/api/get-blob-download-url` | GET | Generate download URL for a blob |
| `/api/kanban-state` | GET/POST | Read/write kanban board state (Netlify Blobs, `sodexo-kanban-state` store) |
| `/api/kanban-attachment` | POST | Manage kanban card file attachments |

**Shared database module:** `netlify/functions/lib/db.mjs` — pooled PostgreSQL connection via `postgres` package using `NETLIFY_DATABASE_URL` env var.

### CSS Design System

`css/tokens.css` defines the SIN Design System variables:
- Color palette: teal primary, purple secondary, status colors, neutral scale.
- Typography: Inter font, 8 size steps, 4 weights.
- Spacing: 8-level system (4px–64px).
- Z-index layers: dropdown, sticky, modal-backdrop, modal, tooltip, toast.

Layout files: `report.css` (main app + sidebar), `form.css` (form components), `kanban.css` (board UI).

## Coding Guidelines

- **No build step:** All frontend JS is vanilla ES6+ modules loaded directly by the browser.
- **Class-based architecture:** Each major feature is a class (`ReportReader`, `KanbanManager`, `AutoSaveManager`, `RoteiroParser`).
- **Markdown backward compatibility:** When modifying `parseMarkdown` or article-specific renderers, ensure existing content formats still render correctly. The transformation logic depends on specific header patterns and bold-text prefixes in the Markdown.
- **Dual storage pattern:** PostgreSQL for structured data, Netlify Blobs for binary files. Attachments are linked to submissions via metadata.
- **Offline-first:** localStorage is the source of truth during editing; cloud sync is eventual.
- **CSS variables:** Always use tokens from `tokens.css` for colors, spacing, and typography. Prefer logical properties (`inline-start`, `block-start`).

## Adding New Articles

1. Create a Markdown file in `Refined/`.
2. Add an entry to the `ARTICLES` array in `js/config.js` (id, title, subtitle, path, icon).
3. Assign it to a navigation group in the same config.
4. If it needs custom rendering, add a case in `processArticleContent()` in `js/app.js`.

## Adding New API Endpoints

1. Create a `.mjs` file in `netlify/functions/`.
2. Export a default async `handler(event)` function returning `{ statusCode, body, headers }`.
3. Include CORS headers. Import `db` from `./lib/db.mjs` if database access is needed.
4. The function is automatically available at `/api/<filename>` via the redirect rule in `netlify.toml`.
