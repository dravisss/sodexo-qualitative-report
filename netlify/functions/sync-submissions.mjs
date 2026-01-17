import { sql } from './lib/db.mjs';

/**
 * Sync Submissions - Upsert Logic
 * POST /api/sync-submissions
 * 
 * Body: {
 *   submission_id?: string (UUID) - If provided, UPDATE. Otherwise INSERT.
 *   unit_slug: string,
 *   answers: object,
 *   respondent_info?: object
 * }
 */
export default async (req, context) => {
    // CORS headers for browser requests
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers
        });
    }

    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500, headers
        });
    }

    try {
        const body = await req.json();
        const { submission_id, unit_slug, answers, respondent_info } = body;

        if (!unit_slug || !answers) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: unit_slug, answers'
            }), { status: 400, headers });
        }

        let result;

        if (submission_id) {
            // UPDATE existing submission
            result = await sql`
                UPDATE submissions 
                SET 
                    answers = ${JSON.stringify(answers)}::jsonb,
                    respondent_info = ${respondent_info ? JSON.stringify(respondent_info) : null}::jsonb,
                    last_synced_at = NOW(),
                    updated_at = NOW()
                WHERE id = ${submission_id}::uuid
                RETURNING id, last_synced_at
            `;

            if (result.length === 0) {
                // ID not found, INSERT instead
                result = await sql`
                    INSERT INTO submissions (unit_slug, answers, respondent_info)
                    VALUES (${unit_slug}, ${JSON.stringify(answers)}::jsonb, ${respondent_info ? JSON.stringify(respondent_info) : null}::jsonb)
                    RETURNING id, last_synced_at
                `;
            }
        } else {
            // INSERT new submission
            result = await sql`
                INSERT INTO submissions (unit_slug, answers, respondent_info)
                VALUES (${unit_slug}, ${JSON.stringify(answers)}::jsonb, ${respondent_info ? JSON.stringify(respondent_info) : null}::jsonb)
                RETURNING id, last_synced_at
            `;
        }

        return new Response(JSON.stringify({
            success: true,
            submission_id: result[0].id,
            synced_at: result[0].last_synced_at
        }), { status: 200, headers });

    } catch (error) {
        console.error('Sync error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/sync-submissions'
};
