import { getStore } from '@netlify/blobs';

/**
 * Kanban State Management
 * GET /api/kanban-state - Retrieve current state
 * POST /api/kanban-state - Save new state
 */
export default async (req, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const store = getStore('sodexo-kanban-state');
        const STATE_KEY = 'latest';

        if (req.method === 'GET') {
            const state = await store.get(STATE_KEY, { type: 'json' });
            return new Response(JSON.stringify(state || {}), { status: 200, headers });
        }

        if (req.method === 'POST') {
            const body = await req.json();

            // Validate basic structure (optional but good practice)
            if (typeof body !== 'object') {
                return new Response(JSON.stringify({ error: 'Invalid state format' }), {
                    status: 400, headers
                });
            }

            await store.set(STATE_KEY, JSON.stringify(body));

            return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers
        });

    } catch (error) {
        console.error('Kanban State Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers
        });
    }
};

export const config = {
    path: '/api/kanban-state'
};
