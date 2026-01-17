import { sql } from './lib/db.mjs';

/**
 * Get Submission - Fetches a single submission by ID
 * GET /api/get-submission?id=UUID
 */
export default async (req, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing ID parameter' }), {
            status: 400, headers
        });
    }

    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500, headers
        });
    }

    try {
        const result = await sql`
            SELECT s.*, 
                   (SELECT json_agg(a.*) FROM attachments a WHERE a.submission_id = s.id) as attachments
            FROM submissions s
            WHERE s.id = ${id}::uuid
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Submission not found' }), {
                status: 404, headers
            });
        }

        return new Response(JSON.stringify({
            success: true,
            submission: result[0]
        }), { status: 200, headers });

    } catch (error) {
        console.error('Fetch error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/get-submission'
};
