import { getStore } from '@netlify/blobs';
import { sql } from './lib/db.mjs';

/**
 * Remove Attachment - Deletes a single attachment row and its blob
 * POST /api/remove-attachment
 * Body: { submission_id: uuid, field_id: string, blob_key: string }
 */
export default async (req, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }

    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500,
            headers
        });
    }

    try {
        const body = await req.json();
        const { submission_id, field_id, blob_key } = body || {};

        if (!submission_id || !field_id || !blob_key) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: submission_id, field_id, blob_key'
            }), { status: 400, headers });
        }

        const deleted = await sql`
            DELETE FROM attachments
            WHERE submission_id = ${submission_id}::uuid
              AND field_id = ${field_id}
              AND blob_key = ${blob_key}
            RETURNING blob_key
        `;

        if (deleted.length === 0) {
            return new Response(JSON.stringify({ error: 'Attachment not found' }), {
                status: 404,
                headers
            });
        }

        // Also remove stale references from submissions.answers (JSONB), if present
        try {
            const rows = await sql`
                SELECT answers
                FROM submissions
                WHERE id = ${submission_id}::uuid
                LIMIT 1
            `;

            if (rows.length > 0) {
                const answers = rows[0]?.answers && typeof rows[0].answers === 'object'
                    ? rows[0].answers
                    : {};

                const keyField = `${field_id}_blob`;
                const namesVal = answers[field_id];
                const keysVal = answers[keyField];

                const normalizeArr = (v) => {
                    if (!v) return [];
                    if (Array.isArray(v)) return v.filter(x => x != null && String(x).trim() !== '');
                    if (typeof v === 'string') return String(v).trim() ? [v] : [];
                    return [];
                };

                const names = normalizeArr(namesVal);
                const keys = normalizeArr(keysVal);

                const idx = keys.indexOf(blob_key);
                if (idx >= 0) {
                    keys.splice(idx, 1);
                    if (names[idx] !== undefined) names.splice(idx, 1);
                }

                const finalize = (arr) => {
                    if (!arr || arr.length === 0) return null;
                    if (arr.length === 1) return arr[0];
                    return arr;
                };

                answers[field_id] = finalize(names);
                answers[keyField] = finalize(keys);

                await sql`
                    UPDATE submissions
                    SET answers = ${JSON.stringify(answers)}::jsonb,
                        updated_at = NOW()
                    WHERE id = ${submission_id}::uuid
                `;
            }
        } catch (e) {
            console.warn('Failed to clean submissions.answers:', e);
        }

        try {
            const store = getStore('evidence-files');
            await store.delete(blob_key);
        } catch (blobError) {
            console.warn('Failed to delete blob:', blobError);
        }

        return new Response(JSON.stringify({
            success: true,
            blob_key
        }), { status: 200, headers });

    } catch (error) {
        console.error('Remove attachment error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/remove-attachment'
};
