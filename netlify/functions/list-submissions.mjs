import { sql } from './lib/db.mjs';

/**
 * List Submissions - Fetches all submissions with metadata
 * GET /api/list-submissions
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

    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500, headers
        });
    }

    try {
        const result = await sql`
            SELECT 
                s.id,
                s.unit_slug,
                s.cycle_id,
                s.status,
                s.answers,
                s.respondent_info,
                s.last_synced_at,
                s.created_at,
                s.updated_at,
                (SELECT COUNT(*) FROM attachments a WHERE a.submission_id = s.id) as attachment_count,
                (SELECT json_agg(
                    json_build_object(
                        'id', a.id,
                        'field_id', a.field_id,
                        'file_name', a.file_name,
                        'blob_key', a.blob_key,
                        'content_type', a.content_type
                    )
                ) FROM attachments a WHERE a.submission_id = s.id) as attachments
            FROM submissions s
            ORDER BY s.updated_at DESC
        `;

        return new Response(JSON.stringify({
            success: true,
            submissions: result
        }), { status: 200, headers });

    } catch (error) {
        console.error('List submissions error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/list-submissions'
};
