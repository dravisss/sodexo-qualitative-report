import { sql } from './lib/db.mjs';

/**
 * Sync Submissions - Upsert Logic with Individual Answers
 * POST /api/sync-submissions
 * 
 * Body: {
 *   submission_id?: string (UUID) - If provided, UPDATE. Otherwise INSERT.
 *   unit_slug: string,
 *   answers: object,
 *   answers_metadata?: object - { field_id: { section, subsection, question_text, field_type } }
 *   respondent_info?: object
 * }
 */
export default async (req, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    const normalizeAnswers = (value) => {
        if (!value) return {};

        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                return {};
            }
        }

        if (typeof value !== 'object' || value === null) return {};

        const keys = Object.keys(value);
        if (keys.length === 0) return value;

        const looksLikeCharMap = keys.every(k => {
            const n = parseInt(k, 10);
            return Number.isFinite(n) && String(n) === k;
        });

        if (!looksLikeCharMap) return value;

        try {
            const maxIndex = keys.reduce((max, k) => {
                const n = parseInt(k, 10);
                return Number.isFinite(n) && n > max ? n : max;
            }, 0);

            const chars = [];
            for (let i = 0; i <= maxIndex; i++) {
                if (value[String(i)] !== undefined) {
                    chars.push(value[String(i)]);
                }
            }
            const reconstructed = chars.join('');
            return JSON.parse(reconstructed);
        } catch (e) {
            return {};
        }
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
        let { submission_id, unit_slug, answers, answers_metadata, respondent_info } = body;

        answers = normalizeAnswers(answers);

        if (!unit_slug || !answers) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: unit_slug, answers'
            }), { status: 400, headers });
        }

        // Ensure unit exists to prevent Foreign Key errors (auto-provisioning)
        try {
            await sql`
                INSERT INTO units (slug, name) 
                VALUES (${unit_slug}, ${unit_slug.charAt(0).toUpperCase() + unit_slug.slice(1)})
                ON CONFLICT (slug) DO NOTHING
            `;
        } catch (e) {
            console.warn('Unit auto-provisioning failed:', e);
            // Proceed, as it might be a race condition or read-only issue, 
            // but usually this fixes the missing FK.
        }

        let result;
        let finalSubmissionId = submission_id;

        // Upsert submission (keep JSONB answers for backward compatibility)
        if (submission_id) {
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
                result = await sql`
                    INSERT INTO submissions (unit_slug, answers, respondent_info)
                    VALUES (${unit_slug}, ${JSON.stringify(answers)}::jsonb, ${respondent_info ? JSON.stringify(respondent_info) : null}::jsonb)
                    RETURNING id, last_synced_at
                `;
            }
        } else {
            result = await sql`
                INSERT INTO submissions (unit_slug, answers, respondent_info)
                VALUES (${unit_slug}, ${JSON.stringify(answers)}::jsonb, ${respondent_info ? JSON.stringify(respondent_info) : null}::jsonb)
                RETURNING id, last_synced_at
            `;
        }

        finalSubmissionId = result[0].id;

        // Upsert individual answers with metadata (BATCH OPTIMIZATION + DELETION)
        if (answers_metadata && Object.keys(answers).length > 0) {
            const rowsToInsert = [];
            const idsToDelete = [];

            for (const [fieldId, value] of Object.entries(answers)) {
                if (fieldId.endsWith('_blob')) continue; // Skip blob refs

                if (value === null) {
                    idsToDelete.push(fieldId);
                } else {
                    const meta = answers_metadata[fieldId] || {};
                    rowsToInsert.push({
                        submission_id: finalSubmissionId,
                        field_id: fieldId,
                        field_type: meta.field_type || 'text',
                        section_name: meta.section || null,
                        subsection_name: meta.subsection || null,
                        question_text: meta.question_text || null,
                        answer_value: String(value) // Ensure text
                    });
                }
            }

            // Execute Batched Inserts
            if (rowsToInsert.length > 0) {
                // Batch process in chunks to avoid MAX_PARAMETERS_EXCEEDED (Postgres limit ~65535 parameters)
                const CHUNK_SIZE = 2000; // 2000 rows * 7 columns = 14,000 params (safe)

                for (let i = 0; i < rowsToInsert.length; i += CHUNK_SIZE) {
                    const chunk = rowsToInsert.slice(i, i + CHUNK_SIZE);

                    if (chunk.length > 0) {
                        await sql`
                            INSERT INTO answers ${sql(chunk, 'submission_id', 'field_id', 'field_type', 'section_name', 'subsection_name', 'question_text', 'answer_value')}
                            ON CONFLICT (submission_id, field_id) 
                            DO UPDATE SET 
                                answer_value = EXCLUDED.answer_value,
                                section_name = COALESCE(EXCLUDED.section_name, answers.section_name),
                                subsection_name = COALESCE(EXCLUDED.subsection_name, answers.subsection_name),
                                question_text = COALESCE(EXCLUDED.question_text, answers.question_text),
                                updated_at = NOW()
                        `;
                    }
                }
            }

            // Execute Deletes
            if (idsToDelete.length > 0) {
                await sql`
                    DELETE FROM answers 
                    WHERE submission_id = ${finalSubmissionId} AND field_id = ANY(${idsToDelete})
                `;

                // Also delete from attachments to prevent "zombie files" reappearing
                // AND delete from Netlify Blobs store for full cleanup
                const deletedAttachments = await sql`
                    DELETE FROM attachments 
                    WHERE submission_id = ${finalSubmissionId} AND field_id = ANY(${idsToDelete})
                    RETURNING blob_key
                `;

                if (deletedAttachments.length > 0) {
                    try {
                        const { getStore } = await import('@netlify/blobs');
                        const store = getStore('evidence-files');

                        await Promise.all(deletedAttachments.map(att =>
                            store.delete(att.blob_key)
                        ));
                    } catch (blobError) {
                        console.warn('Failed to delete blobs from store:', blobError);
                        // Non-critical error, continue
                    }
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            submission_id: finalSubmissionId,
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
