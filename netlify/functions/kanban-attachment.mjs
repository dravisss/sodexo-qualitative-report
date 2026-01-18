import { getStore } from '@netlify/blobs';

export default async (req, context) => {
    const baseHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: baseHeaders });
    }

    try {
        const store = getStore('sodexo-kanban-attachments');
        const url = new URL(req.url);
        const key = url.searchParams.get('key');

        if (req.method === 'POST') {
            const formData = await req.formData();
            const file = formData.get('file');
            const cardId = formData.get('cardId');

            if (!file || !cardId) {
                return new Response(JSON.stringify({ error: 'Missing required fields: file, cardId' }), {
                    status: 400,
                    headers: { ...baseHeaders, 'Content-Type': 'application/json' }
                });
            }

            const attachmentId = (globalThis.crypto && globalThis.crypto.randomUUID)
                ? globalThis.crypto.randomUUID()
                : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

            const timestamp = Date.now();
            const sanitizedName = String(file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
            const blobKey = `attachments/${cardId}/${attachmentId}/${timestamp}_${sanitizedName}`;

            await store.set(blobKey, file, {
                metadata: {
                    originalName: file.name,
                    contentType: file.type,
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    cardId,
                    attachmentId
                }
            });

            return new Response(JSON.stringify({
                blobKey,
                id: attachmentId,
                name: file.name,
                mime: file.type,
                size: file.size,
                createdAt: new Date().toISOString()
            }), {
                status: 200,
                headers: { ...baseHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'GET') {
            if (!key) {
                return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
                    status: 400,
                    headers: { ...baseHeaders, 'Content-Type': 'application/json' }
                });
            }

            const blob = await store.getWithMetadata(key, { type: 'blob' });
            if (!blob || !blob.data) {
                return new Response(JSON.stringify({ error: 'File not found' }), {
                    status: 404,
                    headers: { ...baseHeaders, 'Content-Type': 'application/json' }
                });
            }

            const originalName = String(blob.metadata?.originalName || 'file');
            const safeName = originalName.replace(/[\r\n"]/g, '_');
            const contentType = String(blob.metadata?.contentType || 'application/octet-stream');

            return new Response(blob.data, {
                status: 200,
                headers: {
                    ...baseHeaders,
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${safeName}"`
                }
            });
        }

        if (req.method === 'DELETE') {
            if (!key) {
                return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
                    status: 400,
                    headers: { ...baseHeaders, 'Content-Type': 'application/json' }
                });
            }

            await store.delete(key);

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...baseHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...baseHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Kanban Attachment Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
};

export const config = {
    path: '/api/kanban-attachment'
};
