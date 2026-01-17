import { sql } from './lib/db.mjs';

/**
 * Export Submission - Exports submission data in CSV or Markdown format
 * POST /api/export-submission
 * Body: { "submission_id": "uuid", "format": "csv" | "markdown" }
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

    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500, headers
        });
    }

    try {
        const body = await req.json();
        const { submission_id, format } = body;

        if (!submission_id || !format) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: submission_id, format'
            }), { status: 400, headers });
        }

        if (!['csv', 'markdown'].includes(format)) {
            return new Response(JSON.stringify({
                error: 'Invalid format. Must be "csv" or "markdown"'
            }), { status: 400, headers });
        }

        // Fetch submission with attachments
        const result = await sql`
            SELECT s.*, 
                   (SELECT json_agg(a.*) FROM attachments a WHERE a.submission_id = s.id) as attachments
            FROM submissions s
            WHERE s.id = ${submission_id}::uuid
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: 'Submission not found' }), {
                status: 404, headers
            });
        }

        const submission = result[0];
        let content, filename, contentType;

        if (format === 'csv') {
            content = generateCSV(submission);
            filename = `submission_${submission_id.substring(0, 8)}.csv`;
            contentType = 'text/csv';
        } else {
            content = generateMarkdown(submission);
            filename = `submission_${submission_id.substring(0, 8)}.md`;
            contentType = 'text/markdown';
        }

        return new Response(JSON.stringify({
            success: true,
            content,
            filename,
            contentType
        }), { status: 200, headers });

    } catch (error) {
        console.error('Export error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers });
    }
};

function generateCSV(submission) {
    const rows = [['Pergunta', 'Resposta', 'Anexo']];

    const answers = submission.answers || {};

    Object.entries(answers).forEach(([key, value]) => {
        if (!key.endsWith('_blob')) {
            const attachmentKey = `${key}_blob`;
            const attachmentUrl = answers[attachmentKey] || '';
            rows.push([key, value, attachmentUrl]);
        }
    });

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function generateMarkdown(submission) {
    const answers = submission.answers || {};
    const attachments = submission.attachments || [];

    let md = `# Roteiro de Investigação - Submissão\n\n`;
    md += `**ID**: ${submission.id}\n`;
    md += `**Unidade**: ${submission.unit_slug}\n`;
    md += `**Status**: ${submission.status}\n`;
    md += `**Última Sincronização**: ${new Date(submission.last_synced_at).toLocaleString('pt-BR')}\n\n`;

    md += `---\n\n`;
    md += `## Respostas\n\n`;

    Object.entries(answers).forEach(([key, value]) => {
        if (!key.endsWith('_blob') && value) {
            md += `### ${key}\n\n`;
            md += `${value}\n\n`;
        }
    });

    if (attachments.length > 0) {
        md += `---\n\n`;
        md += `## Anexos\n\n`;
        attachments.forEach(att => {
            md += `- **${att.file_name}** (Campo: ${att.field_id})\n`;
            md += `  - Blob Key: \`${att.blob_key}\`\n\n`;
        });
    }

    return md;
}

export const config = {
    path: '/api/export-submission'
};
