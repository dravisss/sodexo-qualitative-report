/**
 * Kanban Manager
 * Handles the interactive Kanban board for intervention management
 */

import { ARTICLES } from './config.js';

class KanbanManager {
    constructor() {
        this.boardEl = document.getElementById('kanban-board');
        this.sidebarEl = document.querySelector('.sin-sidebar');
        this.overlayEl = document.getElementById('sidebar-overlay');

        // Fixed columns definition
        this.columns = [
            { id: 'backlog', title: 'Backlog', class: 'status-backlog', icon: '📥' },
            { id: 'todo', title: 'A Fazer', class: 'status-todo', icon: '📋' },
            { id: 'doing', title: 'Em Andamento', class: 'status-doing', icon: '🚧' },
            { id: 'blocked', title: 'Bloqueado', class: 'status-blocked', icon: '⛔' },
            { id: 'done', title: 'Concluído', class: 'status-done', icon: '✅' }
        ];

        this.init();
    }

    init() {
        this.initializeSidebarState();
        this.setupGeneralEvents();
        this.renderBoard();
    }

    /**
     * Render the initial empty board structure
     */
    renderBoard() {
        this.boardEl.innerHTML = this.columns.map(col => `
            <div class="kanban-column ${col.class}" id="col-${col.id}">
                <div class="kanban-column-header">
                    <span class="column-title">${col.icon} ${col.title}</span>
                    <span class="column-count">0</span>
                </div>
                <div class="kanban-column-body" data-status="${col.id}">
                    <!-- Cards will be injected here -->
                </div>
            </div>
        `).join('');
    }

    /**
     * Setup general UI event listeners (sidebar, mobile menu)
     * Reused logic from ReportReader to maintain consistency
     */
    setupGeneralEvents() {
        // Desktop Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile Menu Trigger
        const mobileToggle = document.getElementById('mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Overlay Click (close drawer)
        if (this.overlayEl) {
            this.overlayEl.addEventListener('click', () => this.toggleMobileMenu(false));
        }
    }

    /**
     * Initial sidebars state from localStorage
     */
    initializeSidebarState() {
        const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        if (isCollapsed) {
            this.sidebarEl.classList.add('collapsed');
        }
    }

    /**
     * Toggle desktop sidebar slim/full mode
     */
    toggleSidebar() {
        const isCollapsed = this.sidebarEl.classList.toggle('collapsed');
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }

    /**
     * Toggle mobile drawer
     */
    toggleMobileMenu(forceState) {
        const isOpen = typeof forceState === 'boolean' ? forceState : !this.sidebarEl.classList.contains('mobile-open');

        if (isOpen) {
            this.sidebarEl.classList.add('mobile-open');
            this.overlayEl.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        } else {
            this.sidebarEl.classList.remove('mobile-open');
            this.overlayEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanManager = new KanbanManager();
});
