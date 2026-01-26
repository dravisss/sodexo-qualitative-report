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
