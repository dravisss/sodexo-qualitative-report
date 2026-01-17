import { getStore } from '@netlify/blobs';

/**
 * Get Blob Download URL - Generates permanent download URLs for attachments
 * GET /api/get-blob-download-url?key=path/to/file
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
    const key = url.searchParams.get('key');

    if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
            status: 400, headers
        });
    }

    try {
        const store = getStore('evidence-files');

        // Get the blob metadata and URL
        const blob = await store.getWithMetadata(key);

        if (!blob) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404, headers
            });
        }

        // Generate a permanent URL (Netlify Blobs URLs are permanent by default)
        // We could also create a signed URL with very long expiry, but for simplicity
        // we'll use the direct blob access pattern
        const downloadUrl = `/.netlify/blobs/get/${key}`;

        return new Response(JSON.stringify({
            success: true,
            url: downloadUrl,
            metadata: blob.metadata,
            expires_in: 'never'
        }), { status: 200, headers });

    } catch (error) {
        console.error('Blob URL error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

export const config = {
    path: '/api/get-blob-download-url'
};
