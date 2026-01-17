import { getStore } from '@netlify/blobs';
import { sql } from './lib/db.mjs';

/**
 * Upload Blob - Handle file uploads to Netlify Blobs
 * POST /api/upload-blob
 * 
 * Expects multipart/form-data with:
 * - file: The binary file
 * - submission_id: UUID of the submission
 * - field_id: The form field identifier (e.g., 'question_12_file')
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
            status: 405, headers
        });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const submissionId = formData.get('submission_id');
        const fieldId = formData.get('field_id');

        if (!file || !submissionId || !fieldId) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: file, submission_id, field_id'
            }), { status: 400, headers });
        }

        // Get the Netlify Blobs store
        const store = getStore('evidence-files');

        // Generate unique key
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blobKey = `${submissionId}/${fieldId}/${timestamp}_${sanitizedName}`;

        // Upload to Netlify Blobs
        const arrayBuffer = await file.arrayBuffer();
        await store.set(blobKey, new Uint8Array(arrayBuffer), {
            metadata: {
                originalName: file.name,
                contentType: file.type,
                uploadedAt: new Date().toISOString()
            }
        });

        // Record in database
        if (sql) {
            await sql`
                INSERT INTO attachments (submission_id, field_id, file_name, blob_key, content_type)
                VALUES (${submissionId}::uuid, ${fieldId}, ${file.name}, ${blobKey}, ${file.type})
            `;
        }

        return new Response(JSON.stringify({
            success: true,
            blob_key: blobKey,
            file_name: file.name
        }), { status: 200, headers });

    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/upload-blob'
};
