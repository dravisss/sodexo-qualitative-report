import { sql } from './lib/db.mjs';

// Script to add missing columns to 'answers' table if they don't exist
// Usage: export NETLIFY_DATABASE_URL="..." && node netlify/functions/fix-schema.mjs

async function fixSchema() {
    if (!sql) {
        console.error('Database configuration missing.');
        process.exit(1);
    }

    try {
        console.log('Checking "answers" table columns...');

        const requiredColumns = [
            { name: 'field_type', type: "TEXT DEFAULT 'text'" },
            { name: 'section_name', type: 'TEXT' },
            { name: 'subsection_name', type: 'TEXT' },
            { name: 'question_text', type: 'TEXT' },
            { name: 'answer_value', type: 'TEXT' }
        ];

        for (const col of requiredColumns) {
            try {
                // Try to add column. If it exists, Postgres throws error, we ignore.
                // "ALTER TABLE ... ADD COLUMN IF NOT EXISTS" is supported in Postgres 9.6+
                console.log(`Ensuring column ${col.name} exists...`);
                await sql.unsafe(`ALTER TABLE answers ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) {
                console.warn(`Error check for ${col.name} (might already exist):`, e.message);
            }
        }

        console.log('✅ Schema columns verified/patched successfully!');

    } catch (e) {
        console.error('❌ Schema fix failed:', e);
    } finally {
        await sql.end();
    }
}

fixSchema();
