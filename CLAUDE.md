# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Single Page Application (SPA) designed for reading qualitative reports. It focuses on analyzing systemic tensions and intervention plans. The app fetches and renders Markdown files as interactive articles.

- **Stack:** Vanilla JavaScript (ES Modules), HTML5, CSS3.
- **Backend:** Netlify Functions & Netlify Blobs (serverless).
- **Data Source:** Markdown files in `Refined/` directory.
- **Deployment:** Netlify (Static site + Functions).

## Development Commands

### Setup
- `npm install` - Install dependencies (mainly for Netlify Functions).

### Running Locally
- **Frontend Only:** Any static file server works.
  - `npx serve .` or `python3 -m http.server 8000`
- **Full App (with Functions):**
  - `netlify dev` - Runs the site with Netlify Functions emulation (requires Netlify CLI).

### Testing
- No automated test suite is currently configured.
- Manual testing involves verifying the rendering of Markdown articles and the functionality of interactive components (Forms, Kanban board).

## Architecture & Structure

### Frontend (`/`)
- **Entry Point:** `index.html` loads `js/app.js`.
- **Routing:** Hash-based routing (e.g., `#01`, `#08`).
- **Logic (`js/app.js`):**
  - `ReportReader` class manages state, navigation, and rendering.
  - Fetches Markdown content via `fetch()`.
  - Parses Markdown using `marked.js` with custom extensions (alerts, custom cards).
  - Post-processes HTML to create interactive visualizations (War Room, Matrices).
- **Configuration (`js/config.js`):** Central manifest of all articles/reports.
- **Styles (`css/`):** Custom CSS using CSS variables for theming (SIN Design System).

### Backend (`netlify/functions/`)
- Serverless functions (Node.js/ESM) for dynamic features.
- Handles form submissions, data synchronization, and file uploads (Blobs).
- **Key Functions:**
  - `sync-submissions.mjs`: Syncs local form data to the cloud.
  - `upload-blob.mjs`: Handles file attachments.

### Content (`Refined/`)
- Markdown files containing the actual report content.
- Uses specific formatting (H2/H3 headers, bold text) which the parser transforms into UI components (Tabs, Accordions).

## Coding Guidelines

- **JavaScript:** Use modern ES6+ features (Modules, Async/Await, Classes). No build step/bundler for frontend code.
- **CSS:** Use CSS Variables for colors and spacing. Prefer logical properties.
- **Markdown Processing:** When modifying `parseMarkdown` or `renderInterventions`, ensure backward compatibility with existing content formats.
- **State Management:** Local state uses `localStorage` for offline capability, syncing with Netlify Functions when online.
- **Error Handling:** Gracefully handle network errors when fetching Markdown or calling functions.
