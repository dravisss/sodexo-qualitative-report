import { getStore } from '@netlify/blobs';

/**
 * Download Blob - Streams file content directly to browser
 * GET /api/download-blob?key=path/to/file
 */
export default async (req, context) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get('key');

    if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const store = getStore('evidence-files');
        const blob = await store.getWithMetadata(key, { type: 'blob' });

        if (!blob || !blob.data) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const fileName = blob.metadata?.originalName || key.split('/').pop() || 'download';
        const contentType = blob.metadata?.contentType || 'application/octet-stream';

        return new Response(blob.data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Download blob error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: '/api/download-blob'
};
